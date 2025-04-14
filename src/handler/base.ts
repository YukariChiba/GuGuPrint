import { Message } from 'typegram';

interface MessageHandlerInterface {
	msgtypes: string[];

	handle(msg: Message): Promise<void>;
}

export default MessageHandlerInterface;
