import * as process from 'node:process';
import iconv from 'iconv-lite';
import * as emoji from 'node-emoji';
import { Jimp } from 'jimp';

const print_content_raw = async (pruser: string, content: string) => {
	const tstamp = Math.floor(Date.now() / 1000).toString();
	const payload2 = {
		ak: process.env.ENV_GUGU_AK,
		timestamp: tstamp,
		memobirdID: process.env.ENV_GUGU_ID,
		userID: await bind_user(pruser, tstamp),
		printcontent: content,
	};
	const r = await fetch('http://open.memobird.cn/home/printpaper', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload2),
	});
	const rjson: any = await r.json();
	console.log(rjson);
	return rjson['showapi_res_error'];
};

const print_content_html = async (pruser: string, content: string) => {
	const tstamp = Math.floor(Date.now() / 1000).toString();
	const payload2 = {
		ak: process.env.ENV_GUGU_AK,
		timestamp: tstamp,
		memobirdID: process.env.ENV_GUGU_ID,
		userID: await bind_user(pruser, tstamp),
		printHtml: encodeURI(iconv.encode(content, 'gbk').toString('base64')),
	};
	const r = await fetch('http://open.memobird.cn/home/printpaperFromHtml', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload2),
	});
	const rjson: any = await r.json();
	console.log(rjson);
	return rjson['showapi_res_error'];
};

const process_image = async (image: ArrayBuffer): Promise<PrintContent> => {
	const imagebase64 = (await (await Jimp.fromBuffer(image)).resize({ w: 384 }).getBuffer('image/png')).toString('base64');
	const payload2 = {
		ak: process.env.ENV_GUGU_AK,
		imgBase64String: imagebase64,
	};
	const r = await fetch('http://open.memobird.cn/home/getSignalBase64Pic', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload2),
	});
	const rjson: any = await r.json();
	return new PrintContent('P', rjson['result']);
};

// const process_image = async (image: ArrayBuffer): Promise<PrintContent> => {
// 	const imagebase64 = (
// 		await (await Jimp.fromBuffer(image)).resize({ w: 384 }).rotate({ deg: 180 }).greyscale().getBuffer('image/bmp', { bitPP: 1 })
// 	).toString('base64');
// 	return new PrintContent('P', imagebase64);
// };

const bind_user = async (pruser: string, tstamp: string) => {
	const payload = {
		ak: process.env.ENV_GUGU_AK,
		timestamp: tstamp,
		memobirdID: process.env.ENV_GUGU_ID,
		useridentifying: pruser,
	};
	const r = await fetch('http://open.memobird.cn/home/setuserbind', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
	const rjson: any = await r.json();
	return rjson['showapi_userid'];
};

class PrintContent {
	type: string;
	content: string;
	constructor(type = 'T', content = '') {
		this.type = type;
		this.content = content;
	}
}

const print_content = async (pruser: string, contents: PrintContent[]) => {
	const print_data = contents.map((c) => `${c.type}:${c.content}`).join('|');
	return await print_content_raw(pruser, print_data);
};

const process_html = (html: string): string => {
	return String(html)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/ /g, '&nbsp;')
		.replace(/\n/g, '<br>');
};

const process_text = (text: string): PrintContent => {
	let outdata = text.replace(/[\u00A0\u202F]/g, ' ');
	outdata = emoji.unemojify(outdata);
	outdata = iconv.encode(outdata, 'gbk').toString('base64');
	return new PrintContent('T', outdata);
};

export { process_text, print_content, process_image, print_content_html, process_html };
