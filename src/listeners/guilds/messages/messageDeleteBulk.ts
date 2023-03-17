import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { bold } from "colorette";
import type { Collection, GuildTextBasedChannel, Message, Snowflake } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.MessageBulkDelete })
export class UserListener extends Listener {
	public async run(messages: Collection<Snowflake, Message>, channel: GuildTextBasedChannel) {
		await this.totalMessagesDeleted(messages, channel);
		await this.channelMessagesDeleted(messages, channel);
		await this.memberMessagesDeleted(messages);
	}

	private async totalMessagesDeleted(messages: Collection<Snowflake, Message>, channel: GuildTextBasedChannel) {
		await this.container.client.prisma.guild.update({
			where: { id: String(channel.guild?.id) },
			data: {
				messagesDeleted: {
					increment: messages.size
				}
			}
		});
	}

	private async channelMessagesDeleted(messages: Collection<Snowflake, Message>, channel: GuildTextBasedChannel) {
		const channelDb = await this.container.client.prisma.channel.findFirst({ where: { id: channel.id } });
		if (!channelDb) {
			this.container.logger.info(`Initializing entry for channel ${bold(channel.id)}...`);

			await this.container.client.prisma.channel.create({
				data: {
					id: channel.id
				}
			}).catch(e => {
				this.container.logger.error(`Failed to initialize channel ${bold(channel.id)}, error below.`);
				this.container.logger.error(e);
			});
		}

		await this.container.client.prisma.channel.update({
			where: { id: channel.id },
			data: {
				messagesDeleted: {
					increment: messages.size
				}
			}
		});
	}

	private async memberMessagesDeleted(messages: Collection<Snowflake, Message>) {
		for (const messageCollection of messages) {
			const message = messageCollection[1];
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
					messagesDeleted: {
						increment: messages.filter(author => author.id === message.author.id).size
					}
				}
			});
		}
	}
}