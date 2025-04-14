import { Message } from 'typegram';
import { print_content_html, process_html } from '../../api/print';
import { templates, formatters } from '../../messages';
import { toHTML } from '@telegraf/entity';

const html_common_header = `
<style>
* {
  font-size: 20px !important;
}
</style>
`;

async function print_text_entity(msg: Message.TextMessage) {
	const print_msg_header =
		formatters.common_header(msg) +
		(msg.forward_from ? formatters.key('Forward', formatters.user(msg.forward_from)) : '') +
		formatters.title(msg.forward_from ? 'FORWARD' : 'TEXT');
	const print_msg_footer = '\n' + templates.print_msg.footer;
	const print_msg =
		`${html_common_header}<code>${process_html(print_msg_header)}</code>` +
		toHTML(msg) +
		`<br><code>${process_html(print_msg_footer)}</code>`;
	await print_content_html(msg.chat.id.toString(), print_msg);
}

export default print_text_entity;
