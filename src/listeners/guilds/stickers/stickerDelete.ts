import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import type { Sticker } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.GuildStickerDelete })
export class UserListener extends Listener {
	public async run(sticker: Sticker) {
		await this.container.client.prisma.guild.update({
			where: { id: String(sticker.guild?.id) },
			data: {
				stickersDeleted: {
					increment: 1
				}
			}
		});
	}
}