import { Bot, Filter, session } from 'grammy';
import { Context as HonoContext } from 'hono';
import { KvAdapter } from '@grammyjs/storage-cloudflare';
import { SessionData, defaultSessionData } from './session';
import { BotContext } from './context';
import GuGuAPI, { PrintContent } from './api/print';
import HonoEnv from './bindings';
import BotComposer from './commands';
import PrintComposer from './prints';
import SessionFilter from './filter/sessionfilter';
import CallbackComposer from './callback';

class GuGuBot extends Bot<BotContext> {
	honoctx: HonoContext<HonoEnv>;
	guguapi: GuGuAPI;

	async doprint(ctx: Filter<BotContext, 'message'>, content: PrintContent[]) {
		const pruser = await this.guguapi.bind(ctx.msg.from?.id.toString() || 'Unknown');
		const pr_res = await this.guguapi.print(pruser, content);
		ctx.session.lastprint = Date.now();
		if (!ctx.session.whitelist) {
			ctx.session.limit_used++;
			await ctx.reply(`Message received. Daily limit used: ${ctx.session.limit_used}/${ctx.session.limit}.`);
		} else {
			await ctx.reply('Message received. (Whitelisted)');
		}
	}

	public constructor(c: HonoContext) {
		super(c.env.ENV_BOT_TOKEN);
		this.honoctx = c;
		this.guguapi = new GuGuAPI(this.honoctx.env.ENV_GUGU_API, this.honoctx.env.ENV_GUGU_ID, this.honoctx.env.ENV_GUGU_AK);

		this.use(
			session({
				initial: (): SessionData => defaultSessionData,
				storage: new KvAdapter<SessionData>(c.env.KV),
			}),
		);

		const generic_on = this.chatType('private').on('message');

		generic_on.use(new BotComposer(this.honoctx));
		generic_on.use(new SessionFilter(this.honoctx).filter).use(new PrintComposer(this.honoctx));
		this.chatType('private').use(new CallbackComposer(this.honoctx));

		this.catch((e) => {
			console.log(e);
		});
	}
}

export default GuGuBot;
