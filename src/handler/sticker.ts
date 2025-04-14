import MessageHandler from './base';
import { Message } from 'typegram';
import { sendPlainText, getFile } from '../api/telegram';
import { templates, formatters } from '../messages';
import { process_text, print_content, process_image } from '../api/print';
//import { fileTypeFromBuffer } from 'file-type';

const stickerMod: MessageHandler = {
	msgtypes: ['sticker'],

	async handle(msg: Message.StickerMessage): Promise<void> {
		if (msg.sticker.is_animated || msg.sticker.is_video) {
			await sendPlainText(msg.chat.id.toString(), templates.reply_msg.not_supported, msg.message_id.toString());
			return;
		}
		const fileId = msg.sticker.file_id;
		const response = await getFile(fileId);
		// const filetype = await fileTypeFromBuffer(response);
		// if (filetype?.ext != 'jpg') return;
		//return;
		await sendPlainText(msg.chat.id.toString(), templates.reply_msg.received, msg.message_id.toString());
		const print_msg_before =
			formatters.common_header(msg) +
			(msg.forward_from ? formatters.key('Forward', formatters.user(msg.forward_from)) : '') +
			formatters.key('Pack', msg.sticker.set_name || 'Unknown') +
			formatters.title('STICKER');
		const print_msg_after = templates.print_msg.footer;
		const processed_data = [process_text(print_msg_before), await process_image(response), process_text(print_msg_after)];
		await print_content(msg.chat.id.toString(), processed_data);
	},
};

export default stickerMod;
