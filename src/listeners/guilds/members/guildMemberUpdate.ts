import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { GuildMember } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.GuildMemberUpdate })
export class UserListener extends Listener {
	public async run(oldMember: GuildMember, member: GuildMember) {
		if (!oldMember.communicationDisabledUntil && member.communicationDisabledUntil) {
			await this.container.client.prisma.guild.update({
				where: { id: String(member.guild.id) },
				data: {
					membersTimedOut: {
						increment: 1
					}
				}
			});
		}
	}
}