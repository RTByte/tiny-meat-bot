import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { bold } from "colorette";
import type { GuildMember } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.GuildMemberAdd })
export class UserListener extends Listener {
	public async run(member: GuildMember) {
		await this.initializeMember(member);

		await this.container.client.prisma.guild.update({
			where: { id: String(member.guild.id) },
			data: {
				membersJoined: {
					increment: 1
				}
			}
		});
	}

	private async initializeMember(member: GuildMember) {
		const memberDb = await this.container.client.prisma.member.findFirst({ where: { id: member.id } });
		if (!memberDb) {
			this.container.logger.info(`Initializing entry for member ${bold(member.id)}...`);

			await this.container.client.prisma.member.create({
				data: {
					id: member.id
				}
			}).catch(e => {
				this.container.logger.error(`Failed to initialize member ${bold(member.id)}, error below.`);
				this.container.logger.error(e);
			});
		}
	}
}