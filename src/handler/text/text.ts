import { Message } from 'typegram';
import { print_content, process_text } from '../../api/print';
import { templates, formatters } from '../../messages';

async function print_text_text(msg: Message.TextMessage) {
	const print_msg =
		formatters.common_header(msg) +
		(msg.forward_from ? formatters.key('Forward', formatters.user(msg.forward_from)) : '') +
		formatters.title(msg.forward_from ? 'FORWARD' : 'TEXT') +
		msg.text +
		'\n' +
		templates.print_msg.footer;
	await print_content(msg.chat.id.toString(), [process_text(print_msg)]);
}

export default print_text_text;
