import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { ThreadChannel } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.ThreadUpdate })
export class UserListener extends Listener {
	public async run(oldThread: ThreadChannel, thread: ThreadChannel) {

		if (oldThread.archived && !thread.archived) {
			await this.container.client.prisma.guild.update({
				where: { id: String(thread.guild?.id) },
				data: {
					threadsClosed: {
						increment: 1
					}
				}
			});
		}
		if (!oldThread.archived && thread.archived) {
			await this.container.client.prisma.guild.update({
				where: { id: String(thread.guild?.id) },
				data: {
					threadsReopened: {
						increment: 1
					}
				}
			});
		}
	}
}