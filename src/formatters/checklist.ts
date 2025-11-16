import { Checklist } from 'grammy/types';
import BasePrintFormatter from './formatter';

class ChecklistPrintFormatter extends BasePrintFormatter {
	title = 'CHECKLIST';
	static parse(checklist: Checklist) {
		var output = [];
		output = [`Title: ${checklist.title}`, ...checklist.tasks.map((e) => `- ${e.text}`)];
		return output.join('\n');
	}
}

export default ChecklistPrintFormatter;
