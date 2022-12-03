import { DEV, VERSION } from '#root/config';
import type { ListenerOptions, PieceContext } from '@sapphire/framework';
// eslint-disable-next-line no-duplicate-imports
import { Listener, Store } from '@sapphire/framework';
import { bgRed, blue, bold, gray, green, red, whiteBright, yellow } from 'colorette';

export class UserEvent extends Listener {
	private readonly style = DEV ? yellow : blue;

	public constructor(context: PieceContext, options?: ListenerOptions) {
		super(context, {
			...options,
			once: true
		});
	}

	public async run() {
		this.printBanner();
		this.printStoreDebugInformation();

		await this.clientValidation();
		await this.guildValidation();
	}

	private printBanner() {
		const success = green('+');
		// const failure = red('-');


		
		const line01 = whiteBright(String.raw`        ${yellow(',,.,,,,.,.')}             ▄▄▄▄▄▄▄    ▄▄▄▄▄▄▄  ╔▄▄▄▄▄▄▄▄▄▄⌐    ╒▄▄▄▄▄▄   ╒▄▄▄▄▄▄▄▄▄▄▄▄`);
		const line02 = whiteBright(String.raw`   ${yellow(',;╖▄')}${red('▓▓▓▓▓▓▓▓▄')}${yellow('░░░░░─.')}        ███████.  ╒███████  ▐██████████H    ███████▌  ▐████████████`);
		const line03 = whiteBright(String.raw` ${yellow('░╓')}${red('▓▓▓▓▓▓▓▓▓▓')}░╥╗╖░${red('▓▓▓▓▄')}${yellow('░,')}      ████████  ████████  ▐████▀         ▐████████   ▀▀▀█████▀▀▀╙`);
		const line04 = whiteBright(String.raw`${yellow(',░')}${red('▓▓▓▓▓▓▓▓▓▓▓')}▄▒▒▒▄${red('▓▓▓▓▓▓U')}${yellow('░ ')}    ████████▌▐████████  ▐█████▄▄▄▄▄    ████╛█████     █████`);
		const line05 = whiteBright(String.raw`${yellow(']░')}${red('▀▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▌')}${yellow('░ ')}    ████████████▌█████  ▐██████████   █████  ████▌    █████`);
		const line06 = whiteBright(String.raw`${yellow('└░░░')}${red('╙▀▀▓▓▀▀╙')}${yellow('░░░░░░')}${red('▀▓▓▓▓▓')}${yellow('░░ ')}    █████ ██████ █████  ▐████▌       ▐█████▄▄█████    █████`);
		const line07 = whiteBright(String.raw` ${yellow('`▒░░░░░░░░░░░░░░░░░░░░░░▒ ')}    █████ ▐████M █████  ▐█████▄▄▄▄▄⌐ █████████████▌   █████`);
		const line08 = whiteBright(String.raw`    ${yellow('``*╜╜"``      `▒░░░░╜ ')}     █████  ▀██▌  █████  ▐██████████H█████▀    ▀████▄  █████`);

		// Offset Pad
		const pad = ' '.repeat(7);
		const longPad = ' '.repeat(26);
		const connectionPad = ' '.repeat(12);

		console.log(
			String.raw`
${line01} ${pad} ${bgRed(` ${VERSION} `)} ${DEV ? ` ${longPad}${bgRed(' </> DEVELOPMENT MODE ')}` : ''}
${line02}
${line03}
${line04}
${line05}
${line06}
${line07}
${line08}      ${pad}[${success}] Gateway ${connectionPad}[${success}] Prisma
		`.trim()
		);
	}

	private printStoreDebugInformation() {
		const { client, logger } = this.container;
		const stores = [...client.stores.values()];
		const last = stores.pop()!;

		for (const store of stores) logger.info(this.styleStore(store, false));
		logger.info(this.styleStore(last, true));
	}

	private styleStore(store: Store<any>, last: boolean) {
		return gray(`${last ? '└─' : '├─'} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
	}

	private async clientValidation() {
		const { client } = this.container;

		// Fetch client
		const dbClient = await client.prisma.client.findFirst()

		// Validate client entry and ensure it exists
		if (dbClient?.id !== client.id) {
			await client.prisma.client.create({
				data: {
					id: String(client.id),
					restarts: 0
				}
			});
		}

		await client.prisma.client.update({
			where: { id: String(client.id) },
			data: {
				restarts: {
					increment: 1
				}
			}
		})
	}

	private async guildValidation() {
		const { client, logger } = this.container;

		logger.info('Starting guild validation...');

		for (const guildCollection of client.guilds.cache) {
			const guild = guildCollection[1];

			// Check if entry exists for guild. If not, create it
			const dbGuild = await client.prisma.guild.findFirst({ where: { id: guild.id } });
			if (!dbGuild) {
				logger.info(`Initializing guild ${bold(guild.name)} (${guild.id})...`)

				await client.prisma.guild.create({
					data: {
						id: guild.id
					}
				}).catch(e => {
					logger.error(`Failed to initialize guild ${bold(guild.name)} (${guild.id}), error below.`);
					logger.error(e);
				});
			}

			logger.info(`Verified initialization of guild ${bold(guild.name)} (${guild.id})`);
		}

		logger.info('All guilds validated!');
	}
}
