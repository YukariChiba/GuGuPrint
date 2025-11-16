import { Chat, Message, MessageOrigin, User } from 'grammy/types';
import { BotContext } from '../context';
import { PrintContent, PrintContentType } from '../api/print';
import { Filter } from 'grammy';
import { unemojify } from 'node-emoji';
import iconv from 'iconv-lite';

abstract class BasePrintFormatter {
	print_msg = {
		header: ' <-----BEGIN TRANSMISSION----->',
		footer: ' <------END TRANSMISSION------>',
	};
	abstract title: string;

	formattitle(txt: string) {
		const max_len = 24;
		const txt_disp = txt.substring(0, 12);
		const txt_len = txt_disp.length;
		const left_pad = Math.floor((max_len - txt_len) / 2);
		const right_pad = max_len - txt_len - left_pad;
		const title_disp = ' '.repeat(3) + '-'.repeat(left_pad) + txt_disp + '-'.repeat(right_pad);
		return ` ${title_disp}`;
	}
	formatkey(k: string, txt: string) {
		return `${k.toUpperCase()}: ${txt}`;
	}
	formatuser(user: User | Chat | undefined) {
		if (!user) return 'Unknown';
		if (user.username) return `@${user.username}`;
		if (user.first_name || user.last_name) return user.first_name || '' + ' ' + user.last_name || '';
		return 'Unknown';
	}
	formatchannel(ch: Chat.ChannelChat | undefined) {
		if (!ch) return 'Unknown';
		if (ch.username) return `@${ch.username}`;
		return ch.title || 'Unknown';
	}
	formatorigin(user: MessageOrigin) {
		switch (user.type) {
			case 'user':
				return this.formatuser(user.sender_user);
			case 'channel':
				return this.formatchannel(user.chat);
			case 'hidden_user':
				return user.sender_user_name;
			case 'chat':
				return this.formatuser(user.sender_chat);
			default:
				return 'Unknown';
		}
	}
	static formatraw(text: string): PrintContent {
		let outdata = text.replace(/[\u00A0\u202F]/g, ' ');
		outdata = unemojify(outdata);
		outdata = iconv.encode(outdata, 'gbk').toString('base64');
		return new PrintContent(PrintContentType.Text, outdata);
	}

	commonheader = (msg: Message) => {
		var all = [
			this.print_msg.header,
			this.formatkey('Time', new Date(msg.date * 1000).toLocaleString('en-US')),
			this.formatkey('From', this.formatuser(msg.from)),
		];
		if (msg.forward_origin) all.push(this.formatkey('Forward', this.formatorigin(msg.forward_origin)));
		all.push(this.formattitle(this.title));
		all.push('');
		return all;
	};

	commonfooter = () => {
		return ['', this.print_msg.footer];
	};

	format = async (ctx: Filter<BotContext, 'message'>, content: PrintContent) => {
		var allheaders: string[] = [];
		var allfooters: string[] = [];
		allheaders = allheaders.concat(this.commonheader(ctx.msg));
		allheaders = allheaders.concat(this.customheader(ctx.msg));
		allfooters = allfooters.concat(this.commonfooter());
		return [BasePrintFormatter.formatraw(allheaders.join('\n')), content, BasePrintFormatter.formatraw(allfooters.join('\n'))];
	};

	customheader(msg: Message): string[] {
		return [];
	}
}

export default BasePrintFormatter;
