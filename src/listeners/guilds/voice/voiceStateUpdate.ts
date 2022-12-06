import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { bold } from "colorette";
import { VoiceState } from "discord.js";

const activeUsers = new Map<string, Date>();

@ApplyOptions<ListenerOptions>({ event: Events.VoiceStateUpdate })
export class UserListener extends Listener {
	public async run(oldVoice: VoiceState, newVoice: VoiceState) {
		// User Connects to voice channel
		if (!oldVoice.channel && newVoice.channel !== null) {
			if (oldVoice.member !== null) {
				activeUsers.set(oldVoice.member.id, new Date())
			}
		}
		// User Disconnects from voice channel
		else if (!newVoice.channel && oldVoice.channel !== null) {
			const now = new Date();
			const memberId : string = oldVoice.member === null ? '' : oldVoice.member.id;
			
			// Check if member has initialized entry in database, if not create one 
			const memberDb = await this.container.client.prisma.member.findFirst({ where: { id: memberId } });
			if (!memberDb) {
				this.container.logger.info(`Initializing entry for member ${bold(memberId)}...`);
				await this.container.client.prisma.member.create({
					data: {
						id: memberId
					}
				}).catch(e => {
					this.container.logger.error(`Failed to initialize member ${bold(memberId)}, error below.`);
					this.container.logger.error(e);
				});
			}

			const enterTime : Date | undefined = activeUsers.get(memberId);
			
			// check for undefined map entry, this should never happen
			if (enterTime === undefined) {
				this.container.logger.error("User not found in activeUsers map");
				return;
			}
			const totalTimeSeconds : number =  Math.round((now.getTime() - enterTime.getTime()) / 1000);
			activeUsers.delete(memberId);
			await this.container.client.prisma.member.update({
				where: { id: String(memberId) },
				data: {
					timeSpentInVoiceChat: {
						increment: totalTimeSeconds
					}
				}
			});
		}

		// User switches from one voice channel to another
		else if (oldVoice.channel !== null && newVoice.channel !== null) {
			// If per voice channel tracking is implemented switch user's active channel
		}

		// User went from undefined voice channel to undefined voice channel, this should never happen
		else {
			this.container.logger.error("Invalid oldVoice and newVoice channels");
		}
	}
}