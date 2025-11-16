import { Message } from 'grammy/types';
import BasePrintFormatter from './formatter';

class StickerPrintFormatter extends BasePrintFormatter {
	title = 'STICKER';
	override customheader(msg: Message): string[] {
		const stickersetname = msg.sticker?.set_name;
		if (stickersetname) return [this.formatkey('Pack', stickersetname)];
		else return [];
	}
}

export default StickerPrintFormatter;
