import '#lib/setup';
import { TinyMeatClient } from '#lib/TinyMeatClient';
import { TOKENS } from '#root/config';

const client = new TinyMeatClient;

const main = async () => {
	try {
		await client.login(TOKENS.BOT_TOKEN);
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

void main();
