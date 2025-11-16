import { Filter } from 'grammy';
import { BotContext, ServerContext } from '../context';

interface BaseCallback {
	(honoctx: ServerContext, botctx: Filter<BotContext, 'callback_query:data'>, data?: string): Promise<void>;
}

export default BaseCallback;
