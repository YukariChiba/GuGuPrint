import { Contact } from 'grammy/types';
import BasePrintFormatter from './formatter';

class ContactPrintFormatter extends BasePrintFormatter {
	title = 'CONTACT';
	static parse(contact: Contact) {
		var output = [];
		output = [`Phone: ${contact.phone_number}`, `First Name: ${contact.first_name}`];
		if (contact.last_name) output.push(`Last Name: ${contact.last_name}`);
		if (contact.user_id) output.push(`Telegram: ${contact.user_id}`);
		return output.join('\n');
	}
}

export default ContactPrintFormatter;
