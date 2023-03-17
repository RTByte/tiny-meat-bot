import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { bold } from "colorette";
import type { Message } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.MessageUpdate })
export class UserListener extends Listener {
	public async run(message: Message) {
		if (message.author.bot) return;

		await this.totalMessagesUpdated(message);
		await this.channelMessagesUpdated(message);
		await this.memberMessagesUpdated(message);
	}

	private async totalMessagesUpdated(message: Message) {
		await this.container.client.prisma.guild.update({
			where: { id: String(message.guild?.id) },
			data: {
				messagesUpdated: {
					increment: 1
				}
			}
		});
	}

	private async channelMessagesUpdated(message: Message) {
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
				messagesUpdated: {
					increment: 1
				}
			}
		});
	}

	private async memberMessagesUpdated(message: Message) {
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
				messagesUpdated: {
					increment: 1
				}
			}
		});
	}
}