import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import type { Role } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.GuildRoleDelete })
export class UserListener extends Listener {
	public async run(role: Role) {
		await this.container.client.prisma.guild.update({
			where: { id: String(role.guild.id) },
			data: {
				rolesDeleted: {
					increment: 1
				}
			}
		});
	}
}