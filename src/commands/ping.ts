import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { ChatInputCommand, Command } from '@sapphire/framework';

export class UserCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'ping',
			description: 'Pings Tiny Meat Bot'
		});
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder.setName('ping').setDescription('Pings Tiny Meat Bot')
		);
	}

	public async chatInputRun(interaction: Command.ChatInputInteraction) {
    	const msg = await interaction.reply({ content: `Ping?`, ephemeral: true, fetchReply: true });

		if (isMessageInstance(msg)) {
			const diff = msg.createdTimestamp - interaction.createdTimestamp;
			const ping = Math.round(this.container.client.ws.ping);
			return interaction.editReply(`✅ Pong! \`Bot: ${diff}ms\` \`API: ${ping}ms\``);
		}

		return interaction.editReply('❌ Failed to retrieve ping.');
	}
}