import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { GuildScheduledEvent } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: 'guildScheduledEventUserRemove' })
export class UserListener extends Listener {
	public async run(event: GuildScheduledEvent) {
		await this.container.client.prisma.guild.update({
			where: { id: String(event.guild?.id) },
			data: {
				scheduledEventsUsersRemoved: {
					increment: 1
				}
			}
		});
	}
}