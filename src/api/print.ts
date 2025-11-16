import { Jimp } from 'jimp';
import iconv from 'iconv-lite';

enum PrintContentType {
	Text = 'T',
	Picture = 'P',
}

type BindedUser = number;

class PrintContent {
	type: PrintContentType;
	content: string;
	constructor(type: PrintContentType = PrintContentType.Text, content = '') {
		this.type = type;
		this.content = content;
	}
}

enum APIFunction {
	BindUser = 'setuserbind',
	PrintPaper = 'printpaper',
	PrintHTML = 'printpaperFromHtml',
	ProcessPic = 'getSignalBase64Pic',
}

type GuGuAPIResponse = {
	showapi_res_code: number;
	showapi_res_error: string;
};

type GuGuAPIResponseBindUser = GuGuAPIResponse & { showapi_userid: BindedUser };
type GuGuAPIResponsePrintAny = GuGuAPIResponse & { result: number; smartGuid?: string; printcontentid?: string };
type GuGuAPIResponseProcessPic = GuGuAPIResponse & { result: string };

class GuGuAPI {
	endpoint: string;
	gugu_id: string;
	gugu_ak: string;
	constructor(endpoint: string, id: string, ak: string) {
		this.gugu_id = id;
		this.gugu_ak = ak;
		this.endpoint = endpoint;
	}

	private async raw(func: APIFunction, body: Record<string, any>) {
		const req_body = {
			ak: this.gugu_ak,
			memobirdID: this.gugu_id,
		};
		const r = await fetch(`${this.endpoint}/${func}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...req_body,
				...body,
			}),
		});
		const rjson: any = await r.json();
		return rjson;
	}

	async bind(pruser: string) {
		const tstamp = Math.floor(Date.now() / 1000).toString();
		const payload = {
			timestamp: tstamp,
			useridentifying: pruser,
		};
		const rjson: GuGuAPIResponseBindUser = await this.raw(APIFunction.BindUser, payload);
		return rjson.showapi_userid;
	}

	async processpic(image: ArrayBuffer) {
		const imagebase64 = (await (await Jimp.fromBuffer(image)).resize({ w: 384 }).getBuffer('image/png')).toString('base64');
		const payload = {
			imgBase64String: imagebase64,
		};
		const rjson: GuGuAPIResponseProcessPic = await this.raw(APIFunction.ProcessPic, payload);
		return new PrintContent(PrintContentType.Picture, rjson.result);
	}

	async printraw(pruser: BindedUser, content: string) {
		const tstamp = Math.floor(Date.now() / 1000).toString();
		const payload = {
			timestamp: tstamp,
			userID: pruser,
			printcontent: content,
		};
		const rjson: GuGuAPIResponsePrintAny = await this.raw(APIFunction.PrintPaper, payload);
		return rjson;
	}

	async printhtml(pruser: BindedUser, content: string) {
		const tstamp = Math.floor(Date.now() / 1000).toString();
		const payload = {
			timestamp: tstamp,
			userID: pruser,
			printcontent: encodeURI(iconv.encode(content, 'gbk').toString('base64')),
		};
		const rjson: GuGuAPIResponsePrintAny = await this.raw(APIFunction.PrintHTML, payload);
		return rjson;
	}

	async print(pruser: BindedUser, contents: PrintContent[]) {
		const print_data = contents.map((c) => `${c.type}:${c.content}`).join('|');
		return await this.printraw(pruser, print_data);
	}
}

export default GuGuAPI;
export { PrintContentType, PrintContent };
