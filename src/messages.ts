import { Contact, Message, User } from 'typegram';

const templates = {
	reply_msg: {
		received: 'Message received',
		not_supported: 'Message type not supported',
		start: 'Send me something, and I will forward and print it on the printer of @YukariChiba',
	},
	print_msg: {
		header: ' <-----BEGIN TRANSMISSION----->\n',
		footer: ' <------END TRANSMISSION------>\n',
	},
};

const formatters = {
	title(txt: string) {
		const max_len = 24;
		const txt_disp = txt.substring(0, 12);
		const txt_len = txt_disp.length;
		const left_pad = Math.floor((max_len - txt_len) / 2);
		const right_pad = max_len - txt_len - left_pad;
		const title_disp = ' '.repeat(3) + '-'.repeat(left_pad) + txt_disp + '-'.repeat(right_pad);
		return ` ${title_disp}\n`;
	},
	key(k: string, txt: string) {
		return `${k.toUpperCase()}: ${txt}\n`;
	},
	common_header(msg: Message) {
		return (
			templates.print_msg.header +
			formatters.key('Time', new Date(msg.date * 1000).toLocaleString('en-US')) +
			formatters.key('From', formatters.user(msg.from))
		);
	},
	user(user: User | undefined) {
		if (!user) {
			return 'Unknown';
		}
		if (user.username) {
			return `@${user.username}`;
		}
		if (user.first_name || user.last_name) {
			return user.first_name || '' + ' ' + user.last_name || '';
		}
		return 'Unknown';
	},
};

export { templates, formatters };
