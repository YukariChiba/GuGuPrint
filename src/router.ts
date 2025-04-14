import * as process from 'node:process';
import { Update } from 'typegram';
import handlers from './handler';

async function typerouter(update: Update.MessageUpdate) {
	for (const [msgtype, handler] of handlers) {
		if (msgtype in update.message) {
			await handler.handle(update.message);
			return;
		}
	}
}

async function routerfilter(update: Update.MessageUpdate) {
	if ('message' in update) {
		if (!('from' in update.message)) return;
		if (update.message.chat.type !== 'private') return;
		await typerouter(update);
	}
}

async function router(request: Request, ctx: ExecutionContext) {
	if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== process.env.ENV_BOT_SECRET) {
		return new Response('Unauthorized', { status: 403 });
	}
	const update: Update.MessageUpdate = await request.json();
	ctx.waitUntil(routerfilter(update));

	return new Response('Ok');
}

export default router;
