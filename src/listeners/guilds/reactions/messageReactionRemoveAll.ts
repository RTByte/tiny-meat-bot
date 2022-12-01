import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { Collection, Message, MessageReaction, Snowflake } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.MessageReactionRemoveAll })
export class UserListener extends Listener {
	public async run(message: Message, reactions: Collection<(string | Snowflake), MessageReaction>) {
		await this.container.client.prisma.guild.update({
			where: { id: String(message.guild?.id) },
			data: {
				reactionsRemoved: {
					increment: reactions.size
				}
			}
		})
	}
}