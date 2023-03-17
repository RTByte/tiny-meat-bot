import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import type { Role } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.GuildRoleCreate })
export class UserListener extends Listener {
	public async run(role: Role) {
		await this.container.client.prisma.guild.update({
			where: { id: String(role.guild.id) },
			data: {
				rolesCreated: {
					increment: 1
				}
			}
		});
	}
}