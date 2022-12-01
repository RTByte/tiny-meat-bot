import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { Invite } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.InviteDelete })
export class UserListener extends Listener {
	public async run(invite: Invite) {
		await this.container.client.prisma.guild.update({
			where: { id: String(invite.guild?.id) },
			data: {
				invitesDeleted: {
					increment: 1
				}
			}
		})
	}
}