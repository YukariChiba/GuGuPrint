import { Message } from 'typegram';
import { print_content_html, process_html } from '../../api/print';

async function print_text_plain(msg: Message.TextMessage) {
	await print_content_html(msg.chat.id.toString(), msg.text);
}

export default print_text_plain;
