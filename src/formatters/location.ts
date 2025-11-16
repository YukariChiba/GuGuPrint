import { Location } from 'grammy/types';
import BasePrintFormatter from './formatter';

class LocationPrintFormatter extends BasePrintFormatter {
	title = 'LOCATION';
	static parse(location: Location) {
		var output = [];
		output = [`LAT: ${location.latitude}`, `LNG: ${location.longitude}`];
		return output.join('\n');
	}
}

export default LocationPrintFormatter;
