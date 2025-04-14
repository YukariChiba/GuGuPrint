import { Message } from 'typegram';
import { print_content, process_text } from '../../api/print';

async function print_text_plain(msg: Message.TextMessage) {
	await print_content(msg.chat.id.toString(), [process_text(msg.text.substring('#plain\n'.length))]);
}

export default print_text_plain;
