import { SnowflakeRegex } from '#utils/constants';
import { FormattedCustomEmoji } from '@sapphire/discord-utilities';
import { ChatInputCommand } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { inlineCodeBlock } from '@sapphire/utilities';
import { ChannelType } from 'discord-api-types/v9';
import { parse as parseEmoji } from 'twemoji-parser';

export class UserCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options,
			name: 'stats',
			description: 'Fetch data from the Tiny Meat Bot database',
			subcommands: [
				{ name: 'channel', chatInputRun: 'chatInputChannel' },
				{ name: 'member', chatInputRun: 'chatInputMember' },
				{ name: 'emoji', chatInputRun: 'chatInputEmoji' },
				{
					name: 'top',
					type: 'group',
					entries: [
						{ name: 'channels', chatInputRun: 'chatInputTopChannels' },
						{ name: 'members', chatInputRun: 'chatInputTopMembers' },
						{ name: 'emojis', chatInputRun: 'chatInputTopEmojis' }
						// TODO: Add sticker top subcommand
					]
				}
			]
		});
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('stats')
				.setDescription('Fetch data from the Tiny Meat Bot database')
				.setDefaultMemberPermissions('0')
				.addSubcommand((command) =>
					command
						.setName('channel')
						.setDescription('Fetch data for a specified channel from the Tiny Meat Bot database')
						.addChannelOption(option =>
							option
								.setName('channel')
								.addChannelTypes(ChannelType.GuildNews, ChannelType.GuildNewsThread, ChannelType.GuildPrivateThread, ChannelType.GuildPublicThread, ChannelType.GuildText)
								.setDescription('channel to fetch data for')
								.setRequired(true)
						)
				)
				.addSubcommand((command) =>
					command
						.setName('member')
						.setDescription('Fetch data for a specified member from the Tiny Meat Bot database')
						.addUserOption(option =>
							option
								.setName('member')
								.setDescription('member to fetch data for')
								.setRequired(true)
						)
				)
				.addSubcommand((command) =>
					command
						.setName('emoji')
						.setDescription('Fetch data for a specified emoji from the Tiny Meat Bot database')
						.addStringOption(option =>
							option
								.setName('emoji')
								.setDescription('emoji to fetch data for')
								.setRequired(true)
						)
				)
				.addSubcommandGroup((group) =>
					group
						.setName('top')
						.setDescription('Fetch data in descending order from the Tiny Meat Bot database')
						.addSubcommand((command) =>
							command
								.setName('channels')
								.setDescription('Fetch channel data in descending order from the Tiny Meat Bot database')
								.addNumberOption( option => 
									option
										.setName('amount')
										.setDescription('amount of entries to fetch')
										.setMinValue(2)
										.setRequired(true)
								)
						)
						.addSubcommand((command) =>
							command
								.setName('members')
								.setDescription('Fetch member data in descending order from the Tiny Meat Bot database')
								.addNumberOption( option => 
									option
										.setName('amount')
										.setDescription('amount of entries to fetch')
										.setMinValue(2)
										.setRequired(true)
								)
						)
						.addSubcommand((command) =>
							command
								.setName('emojis')
								.setDescription('Fetch emoji data in descending order from the Tiny Meat Bot database. Prints emoji ID if unavailable')
								.addNumberOption( option => 
									option
										.setName('amount')
										.setDescription('amount of entries to fetch')
										.setMinValue(2)
										.setRequired(true)
								)
						)
						// TODO: Add sticker top subcommand
				)
		);
	}

	public async chatInputChannel(interaction: Subcommand.ChatInputInteraction) {
    	await interaction.reply({ content: `Fetching channel data...`, ephemeral: false, fetchReply: true });

		const channel = interaction.options.getChannel('channel');
		const channelDb = await this.container.client.prisma.channel.findFirst({ where: { id: channel?.id }});

		if (!channelDb) return interaction.editReply(`❌ ${channel} does not exist in the channel database yet.`)

		const data = [
			` • ${inlineCodeBlock(String(channelDb.messages))} messages`, ` • ${inlineCodeBlock(String(channelDb.messagesDeleted))} messages deleted`,
			` • ${inlineCodeBlock(String(channelDb.messagesUpdated))} messages updated`, ` • ${inlineCodeBlock(String(channelDb.reactionsAdded))} reactions added`
		];

		return interaction.editReply(`✅ Channel data fetched!\n\n${channel}:\n${data.join('\n')}\n\n**Last reset:** ${await this.getLastResetDate()}`);
	}

	public async chatInputMember(interaction: Subcommand.ChatInputInteraction) {
    	await interaction.reply({ content: `Fetching member data...`, ephemeral: false, fetchReply: true });

		const member = interaction.options.getUser('member');
		const memberDb = await this.container.client.prisma.member.findFirst({ where: { id: member?.id }});

		if (!memberDb) return interaction.editReply(`❌ ${member} does not exist in the member database yet.`)

		const data = [
			` • ${inlineCodeBlock(String(memberDb?.messages))} messages`, ` • ${inlineCodeBlock(String(memberDb.messagesDeleted))} messages deleted`,
			` • ${inlineCodeBlock(String(memberDb.messagesUpdated))} messages updated`, ` • ${inlineCodeBlock(String(memberDb.emojisInMessages))} emojis sent`,
			` • ${inlineCodeBlock(String(memberDb?.reactionsAdded))} reactions added`, ` • ${inlineCodeBlock(String(memberDb?.stickersInMessages))} stickers sent`,
			` • Subscribed to ${inlineCodeBlock(String(memberDb?.scheduledEventsSubscribed))} events`, ` • Unsubscribed from ${inlineCodeBlock(String(memberDb?.scheduledEventsUnsubscribed))} events`,
      ` • ${inlineCodeBlock(String(memberDb?.timeSpentInVoiceChat))} seconds spent in voice chat`,

		];

		return interaction.editReply(`✅ Member data fetched!\n\n${member}:\n${data.join('\n')}\n\n**Last reset:** ${await this.getLastResetDate()}`);
	}

	public async chatInputEmoji(interaction: Subcommand.ChatInputInteraction) {
    	await interaction.reply({ content: `Fetching emoji data...`, ephemeral: false, fetchReply: true });

		const emojiInput = interaction.options.getString('emoji');
		
		const parsedCustomEmoji = emojiInput?.match(FormattedCustomEmoji);
		const parsedNativeEmoji = parseEmoji(emojiInput as string, { assetType: 'png' })[0];
		const customEmoji = parsedCustomEmoji ? parsedCustomEmoji[0].match(SnowflakeRegex)![0] : null;

		if (!parsedCustomEmoji && !parsedNativeEmoji) return interaction.editReply(`❌ ${emojiInput} could not be parsed as a custom or native emoji, try again.`);
		
		const emojiDb = await this.container.client.prisma.emoji.findFirst({ where: { id: parsedNativeEmoji ? parsedNativeEmoji.text : customEmoji as string }});

		if (!emojiDb) return interaction.editReply(`❌ ${emojiInput} does not exist in the member database yet.`)

		const data = [
			` • Used ${inlineCodeBlock(String(emojiDb?.inMessages))} times in messages`, ` • Used ${inlineCodeBlock(String(emojiDb.inReactions))} times in reactions`,
		]

		return interaction.editReply(`✅ Emoji data fetched!\n\n${emojiInput}:\n${data.join('\n')}\n\n**Last reset:** ${await this.getLastResetDate()}`);
	}

	public async chatInputTopChannels(interaction: Subcommand.ChatInputInteraction) {
    	await interaction.reply({ content: `Fetching channel data...`, ephemeral: false, fetchReply: true });

		const amount = interaction.options.getNumber('amount');
		const channelDb = await this.container.client.prisma.channel.findMany({ take: amount as number, orderBy: { messages: 'desc' } });

		if (!channelDb) return interaction.editReply(`❌ The channel database has not been populated yet.`)

		const data = [];
		for (const channel of channelDb) {
			data.push(` • <#${channel.id}>: ${inlineCodeBlock(String(channel.messages))} messages | ${inlineCodeBlock(String(channel.messagesDeleted))} messages deleted | ${inlineCodeBlock(String(channel.messagesUpdated))} messages updated | ${inlineCodeBlock(String(channel.reactionsAdded))} reactions added`)
		}

		const msg = `✅ Channel data fetched!\n\n**Top ${amount === channelDb.length ? amount : channelDb.length} channels:**\n${data.join('\n')}\n\n**Last reset:** ${await this.getLastResetDate()}`
		if (msg.length > 1950) return interaction.editReply('❌ Response is longer than the max message length, try a lower amount.');

		return interaction.editReply(msg);
	}

	public async chatInputTopMembers(interaction: Subcommand.ChatInputInteraction) {
    	await interaction.reply({ content: `Fetching member data...`, ephemeral: false, fetchReply: true });

		const amount = interaction.options.getNumber('amount');
		const memberDb = await this.container.client.prisma.member.findMany({ take: amount as number, orderBy: { messages: 'desc' } });

		if (!memberDb) return interaction.editReply(`❌ The member database has not been populated yet.`)

		const data = [];
		for (const member of memberDb) {
			data.push(` • <@${member.id}>: ${inlineCodeBlock(String(member.messages))} messages | ${inlineCodeBlock(String(member.messagesDeleted))} messages deleted | ${inlineCodeBlock(String(member.messagesUpdated))} messages updated | ${inlineCodeBlock(String(member.emojisInMessages))} emojis sent | ${inlineCodeBlock(String(member.reactionsAdded))} reactions added | ${inlineCodeBlock(String(member.stickersInMessages))} stickers sent`)
		}

		const msg = `✅ Member data fetched!\n\n**Top ${amount === memberDb.length ? amount : memberDb.length} members:**\n${data.join('\n')}\n\n**Last reset:** ${await this.getLastResetDate()}`
		if (msg.length > 1950) return interaction.editReply('❌ Response is longer than the max message length, try a lower amount.');

		return interaction.editReply(msg);
	}

	public async chatInputTopEmojis(interaction: Subcommand.ChatInputInteraction) {
    	await interaction.reply({ content: `Fetching emoji data...`, ephemeral: false, fetchReply: true });

		const amount = interaction.options.getNumber('amount');
		const emojiDb = await this.container.client.prisma.emoji.findMany({ take: amount as number, orderBy: { inReactions: 'desc' } });

		if (!emojiDb) return interaction.editReply(`❌ The emoji database has not been populated yet.`)

		const data = [];
		for (const emoji of emojiDb) {
			const checkIfCustom = emoji.id.match(SnowflakeRegex);
			const customEmoji = this.container.client.emojis.resolve(emoji.id);
			// if (checkIfCustom && !customEmoji) continue;

			// Check if the emoji is a custom emoji, then checks if the custom emoji is available to the bot. Animated/image emoji check and formatting. Prints bold ID if unavailable to bot. Prints native emoji if not custom.
			const parsedEmoji = checkIfCustom ? customEmoji ? customEmoji?.animated ? `<a:${customEmoji?.name}:${emoji.id}>` : `<:${customEmoji?.name}:${emoji.id}>` : `**${emoji.id}**` : emoji.id;
			data.push(` • ${parsedEmoji}: Used ${inlineCodeBlock(String(emoji.inMessages))} times in messages | Used ${inlineCodeBlock(String(emoji.inReactions))} times in reactions`)
		}

		const msg = `✅ Emoji data fetched!\n\n**Top ${amount === emojiDb.length ? amount : emojiDb.length} emojis:**\n${data.join('\n')}\n\n**Last reset:** ${await this.getLastResetDate()}`
		if (msg.length > 1950) return interaction.editReply('❌ Response is longer than the max message length, try a lower amount.');

		return interaction.editReply(msg);
	}

	// TODO: Add sticker top subcommand

	private async getLastResetDate() {
		const clientDb = await this.container.client.prisma.client.findFirst();

		return `<t:${Math.round(clientDb?.lastReset.getTime() as number / 1000)}:F>`
	}
}