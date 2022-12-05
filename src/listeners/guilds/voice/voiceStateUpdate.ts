import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { VoiceState } from "discord.js";

const activeUsers = new Map<string, Date>();

@ApplyOptions<ListenerOptions>({ event: Events.VoiceStateUpdate })
export class UserListener extends Listener {
	public async run(oldVoice: VoiceState, newVoice: VoiceState) {
		// User Connects to voice channel
		if (!oldVoice.channel && newVoice.channel !== null) {
			this.container.logger.info(`${oldVoice.member?.displayName} connected to ${newVoice.channel.name}`);
			if (oldVoice.member !== null) {
				activeUsers.set(oldVoice.member.id, new Date())
			}
		}
		// User Disconnects from voice channel
		else if (!newVoice.channel && oldVoice.channel !== null) {
			this.container.logger.info(`${newVoice.member?.displayName} disconnected from ${oldVoice.channel.name}`);
			const now = new Date();
			const memberId : string = oldVoice.member === null ? '' : oldVoice.member.id;
			const enterTime : Date | undefined = activeUsers.get(memberId);
			
			// check for undefined map entry, this should never happen
			if (enterTime === undefined) {
				this.container.logger.error("User not found in activeUsers map");
				return;
			}
			const totalTimeSeconds : number =  Math.round((now.getTime() - enterTime.getTime()) / 1000);

			this.container.logger.info(`${newVoice.member?.displayName} spent ${totalTimeSeconds} seconds in ${oldVoice.channel.name}`);
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
			this.container.logger.info(`${oldVoice.member?.displayName} has switched from ${oldVoice.channel.name} to ${newVoice.channel.name}`);
		}
		// User went from undefined voice channel to undefined voice channel, this should never happen
		else {
			this.container.logger.error("Invalid oldVoice and newVoice channels");
		}
	}
}