class RawTelegramApi {
	api: string;
	fileapi: string;
	constructor(token: string) {
		this.api = `https://api.telegram.org/bot${token}`;
		this.fileapi = `https://api.telegram.org/file/bot${token}`;
	}

	private requestURL(methodName: string, params?: Iterable<Iterable<string>> | Record<string, string> | string, api = this.api) {
		let query = '';
		if (params) {
			query = '?' + new URLSearchParams(params).toString();
		}
		return `${api}/${methodName}${query}`;
	}

	async getFileContent(filePath?: string) {
		if (!filePath) return new ArrayBuffer();
		return (await fetch(this.requestURL(filePath, undefined, this.fileapi))).arrayBuffer();
	}

	async registerWebhook(requestUrl: URL, suffix: string) {
		const webhookUrl = `${requestUrl.protocol}//${requestUrl.hostname}${suffix}`;
		const j: any = {
			url: webhookUrl,
		};
		const r: JSON = await (await fetch(this.requestURL('setWebhook', j))).json();
		return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2));
	}

	async unRegisterWebhook() {
		const r: JSON = await (await fetch(this.requestURL('setWebhook', { url: '' }))).json();
		return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2));
	}
}

export default RawTelegramApi;
