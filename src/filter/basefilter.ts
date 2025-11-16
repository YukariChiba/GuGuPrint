import { NextFunction } from 'grammy';
import { BotContext, ServerContext } from '../context';

abstract class BotFilter {
	honoctx: ServerContext;
	constructor(honoctx: ServerContext) {
		this.honoctx = honoctx;
	}

	abstract filter(ctx: BotContext, next: NextFunction): void;
}
export default BotFilter;
