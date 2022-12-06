import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { bold } from "colorette";
import { GuildTextBasedChannel } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.ChannelCreate })
export class UserListener extends Listener {
	public async run(channel: GuildTextBasedChannel) {
		await this.initializeChannel(channel);

		await this.container.client.prisma.guild.update({
			where: { id: String(channel.guild.id) },
			data: {
				channelsCreated: {
					increment: 1
				}
			}
		});
	}

	private async initializeChannel(channel: GuildTextBasedChannel) {
		const channelDb = await this.container.client.prisma.channel.findFirst({ where: { id: channel.id } });
		if (!channelDb) {
			this.container.logger.info(`Initializing entry for channel ${bold(channel.id)}...`);

			await this.container.client.prisma.channel.create({
				data: {
					id: channel.id
				}
			}).catch(e => {
				this.container.logger.error(`Failed to initialize channel ${bold(channel.id)}, error below.`);
				this.container.logger.error(e);
			});
		}
	}
}