import { Filter } from 'grammy';
import { BotContext, ServerContext } from '../context';

interface BaseCommand {
	(honoctx: ServerContext, botctx: Filter<BotContext, 'message'>): Promise<void>;
}

export type { BaseCommand };
