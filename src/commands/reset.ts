import { ChatInputCommand, Command } from '@sapphire/framework';

export class PingCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, { ...options });
  }

  public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName('reset').setDescription('Reset Tiny Meat Bot database')
    );
  }

  public async chatInputRun(interaction: Command.ChatInputInteraction) {
    await interaction.reply({ content: `Resetting database...`, ephemeral: false, fetchReply: true });

    const deleteGuild = await this.container.client.prisma.guild.deleteMany({});
	const deleteChannel = await this.container.client.prisma.channel.deleteMany({});
	const deleteMember = await this.container.client.prisma.member.deleteMany({});
	const deleteEmoji = await this.container.client.prisma.emoji.deleteMany({});
	const deleteSticker = await this.container.client.prisma.sticker.deleteMany({});

    return interaction.editReply(`✅ Database reset. \n\n**Removed:**\n- \`${deleteGuild.count}\` guild entries\n- \`${deleteChannel.count}\` channel entries\n- \`${deleteMember.count}\` member entries\n- \`${deleteEmoji.count}\` emoji entries\n- \`${deleteSticker.count}\` sticker entries`);
  }
}