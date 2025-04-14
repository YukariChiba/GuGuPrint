import MessageHandler from './base';
import { Message } from 'typegram';
import { sendPlainText } from '../api/telegram';
import { templates } from '../messages';
import print_text_text from './text/text';
import print_text_plain from './text/plain';
import print_text_html from './text/html';

const textMod: MessageHandler = {
	msgtypes: ['text'],

	async handle(msg: Message.TextMessage): Promise<void> {
		if (msg.text === '/start') {
			await sendPlainText(msg.chat.id.toString(), templates.reply_msg.start, msg.message_id.toString());
			return;
		}
		if (msg.text.startsWith('#plain\n')) {
			await print_text_plain(msg);
		} else if (msg.text.startsWith('#html\n')) {
			await print_text_html(msg);
		} else {
			await print_text_text(msg);
		}
		await sendPlainText(msg.chat.id.toString(), templates.reply_msg.received, msg.message_id.toString());
	},
};

export default textMod;
