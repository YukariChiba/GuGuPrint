import * as process from 'node:process';

function apiUrl(methodName: string, params?: Iterable<Iterable<string>> | Record<string, string> | string) {
	let query = '';
	if (params) {
		query = '?' + new URLSearchParams(params).toString();
	}
	return `https://api.telegram.org/bot${process.env.ENV_BOT_TOKEN}/${methodName}${query}`;
}

async function registerWebhook(requestUrl: URL, suffix: string) {
	const webhookUrl = `${requestUrl.protocol}//${requestUrl.hostname}${suffix}`;
	const j: any = {
		url: webhookUrl,
		secret_token: process.env.ENV_BOT_SECRET,
		allowed_updates: ['message'],
	};
	const r: JSON = await (await fetch(apiUrl('setWebhook', j))).json();
	return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2));
}

async function unRegisterWebhook() {
	const r: JSON = await (await fetch(apiUrl('setWebhook', { url: '' }))).json();
	return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2));
}

export { apiUrl, registerWebhook, unRegisterWebhook };
