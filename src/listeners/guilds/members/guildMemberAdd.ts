import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { GuildMember } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.GuildMemberAdd })
export class UserListener extends Listener {
	public async run(member: GuildMember) {
		await this.container.client.prisma.guild.update({
			where: { id: String(member.guild.id) },
			data: {
				membersJoined: {
					increment: 1
				}
			}
		});
	}
}