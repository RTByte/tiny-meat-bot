import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import type { GuildBan } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.GuildBanRemove })
export class UserListener extends Listener {
	public async run(ban: GuildBan) {
		await this.container.client.prisma.guild.update({
			where: { id: String(ban.guild.id) },
			data: {
				unbans: {
					increment: 1
				}
			}
		});
	}
}