import MessageHandler from './base';
import { Message } from 'typegram';
import { sendPlainText, getFile } from '../api/telegram';
import { templates, formatters } from '../messages';
import { process_text, print_content, process_image } from '../api/print';
//import { fileTypeFromBuffer } from 'file-type';

const photoMod: MessageHandler = {
	msgtypes: ['photo'],

	async handle(msg: Message.PhotoMessage): Promise<void> {
		const fileId = msg.photo[msg.photo.length - 1].file_id;
		const response = await getFile(fileId);
		// const filetype = await fileTypeFromBuffer(response);
		// if (filetype?.ext != 'jpg') return;
		await sendPlainText(msg.chat.id.toString(), templates.reply_msg.received, msg.message_id.toString());
		const print_msg_before =
			formatters.common_header(msg) +
			(msg.forward_from ? formatters.key('Forward', formatters.user(msg.forward_from)) : '') +
			formatters.title('PHOTO');
		const print_msg_after = templates.print_msg.footer;
		const processed_data = [process_text(print_msg_before), await process_image(response), process_text(print_msg_after)];
		await print_content(msg.chat.id.toString(), processed_data);
	},
};

export default photoMod;
