import { ChatInputCommand, Command } from '@sapphire/framework';
import { MessageAttachment } from 'discord.js';

export class UserCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'export',
			description: 'Get a full export of the Tiny Meat Bot database'
		});
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('export')
				.setDescription('Get a full export of the Tiny Meat Bot database')
				.setDefaultMemberPermissions('0')
		);
	}

	public async chatInputRun(interaction: Command.ChatInputInteraction) {
    	await interaction.reply({ content: `Fetching all data...`, ephemeral: false, fetchReply: true });

		const guild = await this.createGuildCsv();
		const channel = await this.createChannelCsv(interaction);
		const member = await this.createMemberCsv();
		const emoji = await this.createEmojiCsv();
		const sticker = await this.createStickerCsv();

		await interaction.editReply({ content: '✅ Data fetched!', files: [guild, channel, member, emoji, sticker] });
	}

	private async createGuildCsv() {
		const guildDb = await this.container.client.prisma.guild.findFirst({});

		const csvData: (string | number | undefined)[][] = [
			// Header fields
			[
				'id',
				'bans',
				'channelMentions',
				'channelsCreated',
				'channelsDeleted',
				'emojisCreated',
				'emojisDeleted',
				'everyoneMentions',
				'invitesCreated',
				'invitesDeleted',
				'linksSent',
				'membersJoined',
				'membersLeft',
				'membersTimedOut',
				'messages',
				'messagesDeleted',
				'messagesUpdated',
				'reactionsAdded',
				'reactionsRemoved',
				'roleMentions',
				'rolesCreated',
				'rolesDeleted',
				'scheduledEventsCreated',
				'scheduledEventsDeleted',
				'scheduledEventsUsersAdded',
				'scheduledEventsUsersRemoved',
				'stageInstancesCreated',
				'stageInstancesDeleted',
				'stickersCreated',
				'stickersDeleted',
				'threadsClosed',
				'threadsCreated',
				'threadsDeleted',
				'threadsReopened',
				'unbans',
				'userMentions'
			],
			[
				guildDb?.id,
				guildDb?.bans,
				guildDb?.channelMentions,
				guildDb?.channelsCreated,
				guildDb?.channelsDeleted,
				guildDb?.emojisCreated,
				guildDb?.emojisDeleted,
				guildDb?.everyoneMentions,
				guildDb?.invitesCreated,
				guildDb?.invitesDeleted,
				guildDb?.linksSent,
				guildDb?.membersJoined,
				guildDb?.membersLeft,
				guildDb?.membersTimedOut,
				guildDb?.messages,
				guildDb?.messagesDeleted,
				guildDb?.messagesUpdated,
				guildDb?.reactionsAdded,
				guildDb?.reactionsRemoved,
				guildDb?.roleMentions,
				guildDb?.rolesCreated,
				guildDb?.rolesDeleted,
				guildDb?.scheduledEventsCreated,
				guildDb?.scheduledEventsDeleted,
				guildDb?.scheduledEventsUsersAdded,
				guildDb?.scheduledEventsUsersRemoved,
				guildDb?.stageInstancesCreated,
				guildDb?.stageInstancesDeleted,
				guildDb?.stickersCreated,
				guildDb?.stickersDeleted,
				guildDb?.threadsClosed,
				guildDb?.threadsCreated,
				guildDb?.threadsDeleted,
				guildDb?.threadsReopened,
				guildDb?.unbans,
				guildDb?.userMentions
			]
		];

		let csv = '';
		for (const row of csvData) {
			csv += `${row.join(',')  }\n`;
		}

		return new MessageAttachment(Buffer.from(csv), 'guild.csv');
	}

	private async createChannelCsv(interaction: Command.ChatInputInteraction) {
		const channelDb = await this.container.client.prisma.channel.findMany({});

		const csvData: (string | number | undefined)[][] = [
			// Header fields
			[
				'id',
				'channelName',
				'messages',
				'messagesDeleted',
				'messagesUpdated',
				'reactionsAdded',
				'channelMentions',
				'everyoneMentions',
				'roleMentions',
				'userMentions',
				'linksSent'
			]
		];

		for (const entry of channelDb) {
			const channel = interaction.guild?.channels.cache.get(entry.id);

			const row = [
				entry.id,
				channel ? channel?.name : 'Channel unavailable or it was deleted but the database entry still exists',
				entry.messages,
				entry.messagesDeleted,
				entry.messagesUpdated,
				entry.reactionsAdded,
				entry.channelMentions,
				entry.everyoneMentions,
				entry.roleMentions,
				entry.userMentions,
				entry.linksSent
			];

			csvData.push(row);
		}

		let csv = '';
		for (const row of csvData) {
			csv += `${row.join(',')  }\n`;
		}

		return new MessageAttachment(Buffer.from(csv), 'channels.csv');
	}

	private async createMemberCsv() {
		const memberDb = await this.container.client.prisma.member.findMany({});

		const csvData: (string | number | undefined)[][] = [
			// Header fields
			[
				'id',
				'messages',
				'messagesDeleted',
				'messagesUpdated',
				'emojisInMessages',
				'reactionsAdded',
				'stickersInMessages',
				'channelMentions',
				'everyoneMentions',
				'mentionedByOthers',
				'roleMentions',
				'userMentions',
				'linksSent',
				'scheduledEventsSubscribed',
				'scheduledEventsUnsubscribed'
			]
		];

		for (const entry of memberDb) {
			const member = await this.container.client.users.fetch(entry.id);
			
			const row = [
				entry.id,
				member.username || 'Member unavailable or left server',
				entry.messages,
				entry.messagesDeleted,
				entry.messagesUpdated,
				entry.emojisInMessages,
				entry.reactionsAdded,
				entry.stickersInMessages,
				entry.channelMentions,
				entry.everyoneMentions,
				entry.mentionedByOthers,
				entry.roleMentions,
				entry.userMentions,
				entry.linksSent,
				entry.scheduledEventsSubscribed,
				entry.scheduledEventsUnsubscribed
			];

			csvData.push(row);
		}

		let csv = '';
		for (const row of csvData) {
			csv += `${row.join(',')  }\n`;
		}

		return new MessageAttachment(Buffer.from(csv), 'members.csv');
	}

	private async createEmojiCsv() {
		const emojiDb = await this.container.client.prisma.emoji.findMany({});

		const csvData: (string | number | undefined)[][] = [
			// Header fields
			[
				'id',
				'inMessages',
				'inReactions',
				'url'
			]
		];

		for (const entry of emojiDb) {
			const row = [
				entry.id,
				entry.inMessages,
				entry.inReactions,
				entry.url
			];

			csvData.push(row);
		}

		let csv = '';
		for (const row of csvData) {
			csv += `${row.join(',')  }\n`;
		}

		return new MessageAttachment(Buffer.from(csv), 'emojis.csv');
	}

	private async createStickerCsv() {
		const stickerDb = await this.container.client.prisma.sticker.findMany({});

		const csvData: (string | number | undefined)[][] = [
			// Header fields
			[
				'id',
				'uses',
				'url'
			]
		];

		for (const entry of stickerDb) {
			const row = [
				entry.id,
				entry.uses,
				entry.url
			];

			csvData.push(row);
		}

		let csv = '';
		for (const row of csvData) {
			csv += `${row.join(',')  }\n`;
		}

		return new MessageAttachment(Buffer.from(csv), 'stickers.csv');
	}
}