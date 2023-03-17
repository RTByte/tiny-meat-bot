import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import type { ThreadChannel } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.ThreadDelete })
export class UserListener extends Listener {
	public async run(thread: ThreadChannel) {
		await this.container.client.prisma.guild.update({
			where: { id: String(thread.guild?.id) },
			data: {
				threadsDeleted: {
					increment: 1
				}
			}
		});
	}
}