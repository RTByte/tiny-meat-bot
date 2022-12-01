import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { GuildEmoji } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.GuildEmojiDelete })
export class UserListener extends Listener {
	public async run(emoji: GuildEmoji) {
		await this.container.client.prisma.guild.update({
			where: { id: String(emoji.guild.id) },
			data: {
				emojisDeleted: {
					increment: 1
				}
			}
		});
	}
}