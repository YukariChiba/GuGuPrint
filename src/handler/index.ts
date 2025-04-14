import MessageHandler from './base';
import text_mod from './text';
import sticker_mod from './sticker';
import photo_mod from './photo';

let modules: Map<string, MessageHandler> = new Map();

function add_mod(mod: MessageHandler) {
	for (let msgtype of mod.msgtypes) {
		modules.set(msgtype, mod);
	}
}

add_mod(text_mod);
add_mod(sticker_mod);
add_mod(photo_mod);

export default modules;
