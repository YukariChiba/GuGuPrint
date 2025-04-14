import { apiUrl } from './webhook';

async function sendPlainText(chatId: string, text: string, replyId = '') {
	return (
		await fetch(
			apiUrl('sendMessage', {
				chat_id: chatId,
				text,
				reply_to_message_id: replyId,
			}),
		)
	).json();
}

async function getFilePath(fileId: string): Promise<any> {
	return (await fetch(apiUrl('getFile', { file_id: fileId }))).json();
}

async function getFileContent(filePath: string) {
	return (await fetch(`https://api.telegram.org/file/bot${process.env.ENV_BOT_TOKEN}/${filePath}`)).arrayBuffer();
}

async function getFile(fileId: string): Promise<ArrayBuffer> {
	const filePath = (await getFilePath(fileId)).result.file_path;
	return await getFileContent(filePath);
}

export { sendPlainText, getFile };
