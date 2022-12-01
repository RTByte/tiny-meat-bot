import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { StageInstance } from "discord.js";

@ApplyOptions<ListenerOptions>({ event: Events.StageInstanceDelete })
export class UserListener extends Listener {
	public async run(stage: StageInstance) {
		await this.container.client.prisma.guild.update({
			where: { id: String(stage.guild?.id) },
			data: {
				stageInstancesDeleted: {
					increment: 1
				}
			}
		});
	}
}