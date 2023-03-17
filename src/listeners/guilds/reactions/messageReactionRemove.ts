import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import type { MessageReaction } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.MessageReactionRemove })
export class UserListener extends Listener {
	public async run(reaction: MessageReaction) {
		await this.container.client.prisma.guild.update({
			where: { id: String(reaction.message.guild?.id) },
			data: {
				reactionsRemoved: {
					increment: 1
				}
			}
		});
	}
}