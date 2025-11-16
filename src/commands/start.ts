import { BaseCommand } from './base';
import { validate as isValidUUID } from 'uuid';

const cmd: BaseCommand = async (honoctx, botctx) => {
	const arg = botctx.match;
	if (isValidUUID(arg)) {
		const key = await honoctx.env.KV.get(`verify-${botctx.msg.from.id}`);
		if (!key || key != arg) {
			await botctx.reply('Key invalid.');
			return;
		}
		await honoctx.env.KV.delete(`verify-${botctx.msg.from.id}`);
		botctx.session.verified = true;
		await botctx.reply('You are now verified.');
	} else await botctx.reply('Send me something...');
};

export default cmd;
