import { CLIENT_OPTIONS } from "#root/config";
import { PrismaClient } from "@prisma/client";
import { SapphireClient } from '@sapphire/framework';
import { bold, cyanBright, green } from "colorette";

export class TinyMeatClient extends SapphireClient {
	public prisma!: PrismaClient;

	public constructor() {
		super(CLIENT_OPTIONS);
	}

	public async login(token?: string) {
		const prisma = new PrismaClient({
			log: [
				{ emit: 'stdout', level: 'warn' },
				{ emit: 'stdout', level: 'error' },
				{ emit: 'event', level: 'query' },
			],
			errorFormat: 'pretty'
		});

		this.prisma = prisma;

		prisma.$use(async (params, next) => {
			const before = Date.now();

			const result = await next(params);

			const after = Date.now();

			this.logger.debug(
				`${cyanBright('prisma:query')} ${bold(`${params.model}.${params.action}`)} took ${bold(
					`${green(String(after - before))}ms`,
				)}`,
			);

			return result;
		});

		await prisma.$connect();

		this.logger.info('Connecting to Discord...');
		return super.login(token);
	}

	public destroy() {
		void this.prisma.$disconnect();
		return super.destroy();
	}
}

declare module 'discord.js' {
	export interface Client {
		prisma: PrismaClient;
	}
}
