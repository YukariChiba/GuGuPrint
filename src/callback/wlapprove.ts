import { SessionData } from '../session';
import BaseCallback from './base';

const cb: BaseCallback = async (honoctx, botctx, data) => {
	if (!data) return;
	const uid = data.split('-').pop();
	if (!uid) return;
	const obj_txt = await honoctx.env.KV.get(uid);
	if (!obj_txt) return;
	const obj: SessionData = JSON.parse(obj_txt);
	obj.whitelist = true;
	obj.whitelistreq = false;
	await honoctx.env.KV.put(uid, JSON.stringify(obj));
	await botctx.api.sendMessage(parseInt(uid), 'You are now added into whitelist.');
};

export default cb;
