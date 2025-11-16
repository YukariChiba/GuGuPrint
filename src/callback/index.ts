import wlapprove from './wlapprove';
import { BotContext, ServerContext } from '../context';
import { Composer, Filter } from 'grammy';

class CallbackComposer extends Composer<BotContext> {
	honoctx: ServerContext;
	constructor(ctx: ServerContext) {
		super();
		this.honoctx = ctx;

		this.on('callback_query:data', async (botctx) => {
			if (botctx.callbackQuery.from.id != this.honoctx.env.ENV_ADMIN_ID) return;
			const data = botctx.callbackQuery.data;
			const payload = data.split('-').pop();
			if (data.startsWith('wlapprove')) {
				await wlapprove(this.honoctx, botctx, payload);
			}
			await botctx.answerCallbackQuery();
			await botctx.deleteMessage();
		});
	}
}

export default CallbackComposer;
