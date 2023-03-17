import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { bold } from "colorette";
import type { GuildScheduledEvent, User } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: 'guildScheduledEventUserAdd' })
export class UserListener extends Listener {
	public async run(event: GuildScheduledEvent, user: User) {
		await this.totalSubscriptions(event);
		await this.memberSubscriptions(user);
	}

	private async totalSubscriptions(event: GuildScheduledEvent) {
		await this.container.client.prisma.guild.update({
			where: { id: String(event.guild?.id) },
			data: {
				scheduledEventsUsersAdded: {
					increment: 1
				}
			}
		});
	}

	private async memberSubscriptions(user: User) {
		const memberDb = await this.container.client.prisma.member.findFirst({ where: { id: user.id } });
		if (!memberDb) {
			this.container.logger.info(`Initializing entry for member ${bold(user.id)}...`);

			await this.container.client.prisma.member.create({
				data: {
					id: String(user.id)
				}
			}).catch(e => {
				this.container.logger.error(`Failed to initialize member ${bold(user.id)}, error below.`);
				this.container.logger.error(e);
			});
		}

		await this.container.client.prisma.member.update({
			where: { id: user.id },
			data: {
				scheduledEventsSubscribed: {
					increment: 1
				}
			}
		});
	}
}