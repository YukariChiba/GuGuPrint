import { Filter, InlineKeyboard, NextFunction } from 'grammy';
import { BotContext } from '../context';
import BotFilter from './basefilter';

class SessionFilter extends BotFilter {
	filter = async (ctx: Filter<BotContext, 'message'>, next: NextFunction) => {
		if (!ctx.msg.from) return;
		if (!ctx.session.whitelist) {
			if (!ctx.session.verified) {
				const keyboard = new InlineKeyboard().url('Verify', `https://gugubot.nia.workers.dev/github/verify/${ctx.msg.from.id}`);
				await ctx.reply(`You are not verified.`, { reply_markup: keyboard });
				return;
			}
			if (Date.now() - ctx.session.lastprint >= 3600 * 24 * 1000) {
				ctx.session.limit_used = 0;
			}
			if (ctx.session.limit_used >= ctx.session.limit) {
				await ctx.reply(`Daily limit exceeded. (max=${ctx.session.limit})`);
				return;
			}
		}
		await next();
	};
}

export default SessionFilter;
