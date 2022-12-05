import { LinkRegex, SnowflakeRegex } from "#utils/constants";
import { ApplyOptions } from "@sapphire/decorators";
import { FormattedCustomEmoji } from "@sapphire/discord-utilities";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { bold } from "colorette";
import { Message } from "discord.js";
import { parse as parseEmoji } from 'twemoji-parser';

@ApplyOptions<ListenerOptions>({ event: Events.MessageCreate })
export class UserListener extends Listener {
	public async run(message: Message) {
		if (message.author.bot) return;
		
		await this.totalMessages(message);
		await this.channelMessages(message);
		await this.memberMessages(message);
		await this.emojisInMessages(message);
		await this.memberEmojisInMessages(message);
		await this.stickersInMessages(message);
		await this.memberStickersInMessages(message);
		await this.totalMentions(message);
		await this.channelMentions(message);
		await this.memberMentions(message);
		await this.totalLinks(message);
		await this.channelLinks(message);
		await this.memberLinks(message);
	}

	private async totalMessages(message: Message) {
		await this.container.client.prisma.guild.update({
			where: { id: String(message.guild?.id) },
			data: {
				messages: {
					increment: 1
				}
			}
		});
	}

	private async channelMessages(message: Message) {
		const channelDb = await this.container.client.prisma.channel.findFirst({ where: { id: message.channel.id } });
		if (!channelDb) {
			this.container.logger.info(`Initializing entry for channel ${bold(message.channel.id)}...`);

			await this.container.client.prisma.channel.create({
				data: {
					id: message.channel.id
				}
			}).catch(e => {
				this.container.logger.error(`Failed to initialize channel ${bold(message.channel.id)}, error below.`);
				this.container.logger.error(e);
			});
		}

		await this.container.client.prisma.channel.update({
			where: { id: message.channel.id },
			data: {
				messages: {
					increment: 1
				}
			}
		});
	}

	private async memberMessages(message: Message) {
		const memberDb = await this.container.client.prisma.member.findFirst({ where: { id: message.author.id } });
		if (!memberDb) {
			this.container.logger.info(`Initializing entry for member ${bold(message.author.id)}...`);

			await this.container.client.prisma.member.create({
				data: {
					id: message.author.id
				}
			}).catch(e => {
				this.container.logger.error(`Failed to initialize member ${bold(message.author.id)}, error below.`);
				this.container.logger.error(e);
			});
		}

		await this.container.client.prisma.member.update({
			where: { id: message.author.id },
			data: {
				messages: {
					increment: 1
				}
			}
		});
	}

	private async emojisInMessages(message: Message) {
		const parsedCustomEmoji = message.content.match(FormattedCustomEmoji);
		const parsedNativeEmoji = parseEmoji(message.content, { assetType: 'png' });

		if (parsedCustomEmoji?.length) {
			for (const emoji of parsedCustomEmoji) {
				const emojiId = emoji.match(SnowflakeRegex)![0];
				const animated = emoji.includes('<a:');
				const emojiDb = await this.container.client.prisma.emoji.findFirst({ where: { id: emojiId } });
				if (!emojiDb) {
					this.container.logger.info(`Initializing entry for emoji ${bold(emojiId)}...`);

					await this.container.client.prisma.emoji.create({
						data: {
							id: emojiId,
							url: `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? 'gif' : 'png'}`
						}
					}).catch(e => {
						this.container.logger.error(`Failed to initialize emoji ${bold(String(emojiId))}, error below.`);
						this.container.logger.error(e);
					});
				}

				await this.container.client.prisma.emoji.update({
					where: { id: emojiId },
					data: {
						inMessages: {
							increment: 1
						}
					}
				});
			}
		}

		if (parsedNativeEmoji.length) {
			for (const emoji of parsedNativeEmoji) {
				const emojiDb = await this.container.client.prisma.emoji.findFirst({ where: { id: emoji.text } });
				if (!emojiDb) {
					this.container.logger.info(`Initializing entry for emoji ${bold(emoji.text)}...`);

					await this.container.client.prisma.emoji.create({
						data: {
							id: emoji.text,
							url: emoji.url
						}
					}).catch(e => {
						this.container.logger.error(`Failed to initialize emoji ${bold(String(emoji.text))}, error below.`);
						this.container.logger.error(e);
					});
				}

				await this.container.client.prisma.emoji.update({
					where: { id: emoji.text },
					data: {
						inMessages: {
							increment: 1
						}
					}
				});
			}
		}
	}

	private async memberEmojisInMessages(message: Message) {
		const parsedCustomEmoji = message.content.match(FormattedCustomEmoji);
		const parsedNativeEmoji = parseEmoji(message.content, { assetType: 'png' });

		if (parsedCustomEmoji?.length) {
			await this.container.client.prisma.member.update({
				where: { id: message.author.id },
				data: {
					emojisInMessages: {
						increment: parsedCustomEmoji.length
					}
				}
			});
		}

		if (parsedNativeEmoji?.length) {
			await this.container.client.prisma.member.update({
				where: { id: message.author.id },
				data: {
					emojisInMessages: {
						increment: parsedNativeEmoji.length
					}
				}
			});
		}
	}

	private async stickersInMessages(message: Message) {
		if (message.stickers.size >= 1) {
			const sticker = message.stickers.first();

			const stickerDb = await this.container.client.prisma.sticker.findFirst({ where: { id: sticker?.id } });
				if (!stickerDb) {
					this.container.logger.info(`Initializing entry for sticker ${bold(sticker?.id as string)}...`);

					await this.container.client.prisma.sticker.create({
						data: {
							id: sticker?.id as string,
							url: `https://cdn.discordapp.com/stickers/${sticker?.id}.png`
						}
					}).catch(e => {
						this.container.logger.error(`Failed to initialize sticker ${bold(sticker?.id as string)}, error below.`);
						this.container.logger.error(e);
					});
				}

				await this.container.client.prisma.sticker.update({
					where: { id: sticker?.id },
					data: {
						uses: {
							increment: 1
						}
					}
				});
		}
	}

	private async memberStickersInMessages(message: Message) {
		if (message.stickers.size >= 1) {
			await this.container.client.prisma.member.update({
				where: { id: message.author.id },
				data: {
					stickersInMessages: {
						increment: message.stickers.size
					}
				}
			})
		}
	}

	private async totalMentions(message: Message) {
		if (message.mentions.channels.size >= 1) {
			await this.container.client.prisma.guild.update({
				where: { id: message.guild?.id },
				data: {
					channelMentions: {
						increment: message.mentions.channels.size
					}
				}
			});
		}

		if (message.mentions.everyone) {
			await this.container.client.prisma.guild.update({
				where: { id: message.guild?.id },
				data: {
					everyoneMentions: {
						increment: 1
					}
				}
			});
		}

		if (message.mentions.parsedUsers.size >= 1) {
			await this.container.client.prisma.guild.update({
				where: { id: message.guild?.id },
				data: {
					userMentions: {
						increment: message.mentions.parsedUsers.size
					}
				}
			});
		}

		if (message.mentions.roles.size >= 1) {
			await this.container.client.prisma.guild.update({
				where: { id: message.guild?.id },
				data: {
					roleMentions: {
						increment: message.mentions.roles.size
					}
				}
			});
		}
	}

	private async channelMentions(message: Message) {
		if (message.mentions.channels.size >= 1) {
			await this.container.client.prisma.channel.update({
				where: { id: message.channel?.id },
				data: {
					channelMentions: {
						increment: message.mentions.channels.size
					}
				}
			});
		}

		if (message.mentions.everyone) {
			await this.container.client.prisma.channel.update({
				where: { id: message.channel?.id },
				data: {
					everyoneMentions: {
						increment: 1
					}
				}
			});
		}

		if (message.mentions.parsedUsers.size >= 1) {
			await this.container.client.prisma.channel.update({
				where: { id: message.channel?.id },
				data: {
					userMentions: {
						increment: message.mentions.parsedUsers.size
					}
				}
			});
		}

		if (message.mentions.roles.size >= 1) {
			await this.container.client.prisma.channel.update({
				where: { id: message.channel?.id },
				data: {
					roleMentions: {
						increment: message.mentions.roles.size
					}
				}
			});
		}
	}

	private async memberMentions(message: Message) {
		if (message.mentions.channels.size >= 1) {
			await this.container.client.prisma.member.update({
				where: { id: message.author?.id },
				data: {
					channelMentions: {
						increment: message.mentions.channels.size
					}
				}
			});
		}

		if (message.mentions.everyone) {
			await this.container.client.prisma.member.update({
				where: { id: message.author?.id },
				data: {
					everyoneMentions: {
						increment: 1
					}
				}
			});
		}

		if (message.mentions.parsedUsers.size >= 1) {
			const otherUsers = message.mentions.parsedUsers.filter(user => user.id !== message.author.id);
			await this.container.client.prisma.member.update({
				where: { id: message.author?.id },
				data: {
					userMentions: {
						increment: otherUsers.size
					}
				}
			});

			for (const user of message.mentions.parsedUsers) {
				if (user[1].bot) continue;
				
				if (user[1].id !== message.author.id) {
					const memberDb = await this.container.client.prisma.member.findFirst({ where: { id: user[1].id } });
					if (!memberDb) {
						this.container.logger.info(`Initializing entry for member ${bold(user[1].id)}...`);

						await this.container.client.prisma.member.create({
							data: {
								id: user[1].id
							}
						}).catch(e => {
							this.container.logger.error(`Failed to initialize member ${bold(user[1].id)}, error below.`);
							this.container.logger.error(e);
						});
					}

					await this.container.client.prisma.member.update({
						where: { id: user[1].id },
						data: {
							mentionedByOthers: {
								increment: 1
							}
						}
					});
				}
			}
		}

		if (message.mentions.roles.size >= 1) {
			await this.container.client.prisma.member.update({
				where: { id: message.author?.id },
				data: {
					roleMentions: {
						increment: message.mentions.roles.size
					}
				}
			});
		}
	}

	private async totalLinks(message: Message) {
		const parsedLinks = message.content.match(LinkRegex);
		
		if (parsedLinks?.length) {
			await this.container.client.prisma.guild.update({
				where: { id: message.guild?.id },
				data: {
					linksSent: {
						increment: parsedLinks.length
					}
				}
			});
		}
	}

	private async channelLinks(message: Message) {
		const parsedLinks = message.content.match(LinkRegex);
		
		if (parsedLinks?.length) {
			await this.container.client.prisma.channel.update({
				where: { id: message.channel?.id },
				data: {
					linksSent: {
						increment: parsedLinks.length
					}
				}
			});
		}
	}

	private async memberLinks(message: Message) {
		const parsedLinks = message.content.match(LinkRegex);
		
		if (parsedLinks?.length) {
			await this.container.client.prisma.member.update({
				where: { id: message.author?.id },
				data: {
					linksSent: {
						increment: parsedLinks.length
					}
				}
			});
		}
	}
}