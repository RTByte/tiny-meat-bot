import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { MessageReaction } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.MessageReactionAdd })
export class UserListener extends Listener {
	public async run(reaction: MessageReaction) {
		await this.container.client.prisma.guild.update({
			where: { id: String(reaction.message.guild?.id) },
			data: {
				reactionsAdded: {
					increment: 1
				}
			}
		});
	}
}