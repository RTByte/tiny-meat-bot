import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { bold } from "colorette";
import { MessageReaction } from "discord.js";
import { parse as parseEmoji } from 'twemoji-parser';

@ApplyOptions<ListenerOptions>({ event: Events.MessageReactionAdd })
export class UserListener extends Listener {
	public async run(reaction: MessageReaction) {
		if (reaction.users.cache.last()?.bot) return;

		await this.totalReactionsAdded(reaction);
		await this.channelReactionsAdded(reaction);
		await this.memberReactionsAdded(reaction);
		await this.emojisInReactions(reaction);
	}

	private async totalReactionsAdded(reaction: MessageReaction) {
		await this.container.client.prisma.guild.update({
			where: { id: String(reaction.message.guild?.id) },
			data: {
				reactionsAdded: {
					increment: 1
				}
			}
		});
	}

	private async channelReactionsAdded(reaction: MessageReaction) {
		const channelDb = await this.container.client.prisma.channel.findFirst({ where: { id: reaction.message.channel.id } });
		if (!channelDb) {
			this.container.logger.info(`Initializing entry for channel ${bold(reaction.message.channel.id)}...`);

			await this.container.client.prisma.channel.create({
				data: {
					id: reaction.message.channel.id
				}
			}).catch(e => {
				this.container.logger.error(`Failed to initialize channel ${bold(reaction.message.channel.id)}, error below.`);
				this.container.logger.error(e);
			});
		}

		await this.container.client.prisma.channel.update({
			where: { id: reaction.message.channel.id },
			data: {
				reactionsAdded: {
					increment: 1
				}
			}
		});
	}

	private async memberReactionsAdded(reaction: MessageReaction) {
		const memberDb = await this.container.client.prisma.member.findFirst({ where: { id: reaction.users.cache.last()?.id } });
		if (!memberDb) {
			this.container.logger.info(`Initializing entry for member ${bold(String(reaction.users.cache.last()?.id))}...`);

			await this.container.client.prisma.member.create({
				data: {
					id: String(reaction.users.cache.last()?.id)
				}
			}).catch(e => {
				this.container.logger.error(`Failed to initialize member ${bold(String(reaction.users.cache.last()?.id))}, error below.`);
				this.container.logger.error(e);
			});
		}

		await this.container.client.prisma.member.update({
			where: { id: reaction.users.cache.last()?.id },
			data: {
				reactionsAdded: {
					increment: 1
				}
			}
		});
	}

	private async emojisInReactions(reaction: MessageReaction) {
		const nativeEmoji = parseEmoji(reaction.emoji.name as string, { assetType: 'png' })[0];
		const customEmoji = reaction.emoji.id;
		const emoji = customEmoji || nativeEmoji.text;

		const emojiDb = await this.container.client.prisma.emoji.findFirst({ where: { id: emoji } });
		if (!emojiDb) {
			this.container.logger.info(`Initializing entry for emoji ${bold(emoji)}...`);

			await this.container.client.prisma.emoji.create({
				data: {
					id: emoji,
					url: reaction.emoji.url || nativeEmoji.url
				}
			}).catch(e => {
				this.container.logger.error(`Failed to initialize emoji ${bold(String(emoji))}, error below.`);
				this.container.logger.error(e);
			});
		}

		await this.container.client.prisma.emoji.update({
			where: { id: emoji },
			data: {
				inReactions: {
					increment: 1
				}
			}
		});
	}
}