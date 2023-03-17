import { LogLevel } from '@sapphire/framework';
import type { ClientOptions } from 'discord.js';

export const DEV = process.env.NODE_ENV !== 'production';

export const CLIENT_ID = '';
export const OWNERS: string[] = [''];
export const PREFIX = '';
export const VERSION = '0.0.0';

export const CLIENT_OPTIONS: ClientOptions = {
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	defaultPrefix: PREFIX,
	regexPrefix: /^(hey +)?bot[,! ]/i,
	shards: 'auto',
	intents: [],
	loadDefaultErrorListeners: false,
	partials: [],
	presence: {
		activities: [
			{
				name: '',
				type: 3
			}
		]
	},
	logger: {
		level: DEV ? LogLevel.Debug : LogLevel.Info
	},
};

export const TOKENS = {
	BOT_TOKEN: '',
};
