import start from './start';
import reqwhitelist from './reqwhitelist';
import { BotContext, ServerContext } from '../context';
import { Composer, Filter } from 'grammy';

class BotComposer extends Composer<Filter<BotContext, 'message'>> {
	honoctx: ServerContext;
	constructor(ctx: ServerContext) {
		super();
		this.honoctx = ctx;

		this.command('start', async (c) => {
			await start(this.honoctx, c);
		});
		this.command('reqwhitelist', async (c) => {
			await reqwhitelist(this.honoctx, c);
		});
	}
}

export default BotComposer;
