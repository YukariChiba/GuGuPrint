import { InlineKeyboard } from 'grammy';
import { BaseCommand } from './base';

const cmd: BaseCommand = async (honoctx, botctx) => {
	if (botctx.session.whitelist) {
		await botctx.reply('You are already in whitelist.');
		return;
	}
	if (botctx.session.whitelistreq) {
		await botctx.reply('You already requested whitelist.');
		return;
	}
	botctx.session.whitelistreq = true;
	var data = ['Whitelist request'];
	if (botctx.msg.from.username) data.push(`User: @${botctx.msg.from.username}`);
	if (botctx.msg.from.first_name || botctx.msg.from.last_name)
		data.push(`Name: ${botctx.msg.from.first_name || ''} ${botctx.msg.from.last_name || ''}`);
	data.push(`ID: ${botctx.msg.from.id}`);
	const keyboard = new InlineKeyboard().text('Approve', `wlapprove-${botctx.msg.from.id}`).text('Reject', `wlreject-${botctx.msg.from.id}`);
	await botctx.api.sendMessage(honoctx.env.ENV_ADMIN_ID, data.join('\n'), { reply_markup: keyboard });
	await botctx.reply('Okay, request sent.');
};

export default cmd;
