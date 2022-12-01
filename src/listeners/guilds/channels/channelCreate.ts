import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { CategoryChannel, NewsChannel, StageChannel, TextChannel, VoiceChannel } from "discord.js";

type GuildBasedChannel = TextChannel | VoiceChannel | CategoryChannel | NewsChannel | StageChannel;

@ApplyOptions<ListenerOptions>({ event: Events.ChannelCreate })
export class UserListener extends Listener {
	public async run(channel: GuildBasedChannel) {
		await this.container.client.prisma.guild.update({
			where: { id: String(channel.guild.id) },
			data: {
				channelsCreated: {
					increment: 1
				}
			}
		})
	}
}