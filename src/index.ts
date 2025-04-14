import { registerWebhook, unRegisterWebhook } from './api/webhook';
import router from './router';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const pathname = url.pathname;
		switch (pathname) {
			case '/endpoint':
				return router(request, ctx);

			case '/registerWebhook':
				return registerWebhook(url, '/endpoint');

			case '/unRegisterWebhook':
				return unRegisterWebhook();

			default:
				return new Response('No handler for this request');
		}
	},
} satisfies ExportedHandler<Env>;
