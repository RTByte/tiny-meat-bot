import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { bold } from "colorette";
import type { GuildMember } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.GuildMemberUpdate })
export class UserListener extends Listener {
	public async run(oldMember: GuildMember, member: GuildMember) {
		await this.membersTimedOut(oldMember, member);
		await this.totalNicknameChanges(oldMember, member);
		await this.memberNicknameChanges(oldMember, member);
	}

	private async membersTimedOut(oldMember: GuildMember, member: GuildMember) {
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

	private async totalNicknameChanges(oldMember: GuildMember, member: GuildMember) {
		if (oldMember.nickname !== member.nickname) {
			await this.container.client.prisma.guild.update({
				where: { id: member.guild.id },
				data: {
					nicknameChanges: {
						increment: 1
					}
				}
			})
		}
	}

	private async memberNicknameChanges(oldMember: GuildMember, member: GuildMember) {
		if (oldMember.nickname !== member.nickname) {
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

			await this.container.client.prisma.member.update({
				where: { id: member.id },
				data: {
					nicknameChanges: {
						increment: 1
					}
				}
			})
		}
	}
}