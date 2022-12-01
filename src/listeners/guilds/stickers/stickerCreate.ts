import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { Sticker } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.GuildStickerCreate })
export class UserListener extends Listener {
	public async run(sticker: Sticker) {
		await this.container.client.prisma.guild.update({
			where: { id: String(sticker.guild?.id) },
			data: {
				stickersCreated: {
					increment: 1
				}
			}
		});
	}
}