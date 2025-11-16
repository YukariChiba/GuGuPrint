import { Hono } from 'hono';
import HonoEnv from './bindings';
import GuGuBot from './bot';
import { webhookCallback } from 'grammy';
import RawAPI from './api/raw';
import github from './routes/github';

const app = new Hono<HonoEnv>({ strict: false });

app.use('/register', async (c) => {
	const url = new URL(c.req.url);
	const rawAPI = new RawAPI(c.env.ENV_BOT_TOKEN);
	return await rawAPI.registerWebhook(url, '/bot');
});

app.use('/bot', async (c) => {
	const bot = new GuGuBot(c);

	const handler = webhookCallback(bot, 'hono');
	return await handler(c);
});

app.route('/github', github);

export default app;
