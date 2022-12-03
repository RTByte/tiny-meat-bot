import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { GuildTextBasedChannel } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.ChannelCreate })
export class UserListener extends Listener {
	public async run(channel: GuildTextBasedChannel) {
		await this.container.client.prisma.guild.update({
			where: { id: String(channel.guild.id) },
			data: {
				channelsCreated: {
					increment: 1
				}
			}
		});
	}
}