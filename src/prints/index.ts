import GuGuAPI, { PrintContent } from '../api/print';
import { BotContext, ServerContext } from '../context';
import { Composer, Filter } from 'grammy';
import BasePrintFormatter from '../formatters/formatter';
import ChecklistPrintFormatter from '../formatters/checklist';
import ContactPrintFormatter from '../formatters/contact';
import LocationPrintFormatter from '../formatters/location';
import PhotoPrintFormatter from '../formatters/photo';
import StickerPrintFormatter from '../formatters/sticker';
import TextPrintFormatter from '../formatters/text';
import RawTelegramApi from '../api/raw';
import { fileTypeFromBuffer } from 'file-type';

class PrintComposer extends Composer<Filter<BotContext, 'message'>> {
	honoctx: ServerContext;
	guguapi: GuGuAPI;

	async doprint(ctx: Filter<BotContext, 'message'>, content: PrintContent[]) {
		const pruser = await this.guguapi.bind(ctx.msg.from?.id.toString() || 'Unknown');
		const pr_res = await this.guguapi.print(pruser, content);
		ctx.session.lastprint = Date.now();
		if (!ctx.session.whitelist) {
			ctx.session.limit_used++;
			await ctx.reply(`Message received. Daily limit used: ${ctx.session.limit_used}/${ctx.session.limit}.`);
		} else {
			await ctx.reply('Message received. (Whitelisted)');
		}
	}
	constructor(ctx: ServerContext) {
		super();
		this.honoctx = ctx;
		this.guguapi = new GuGuAPI(this.honoctx.env.ENV_GUGU_API, this.honoctx.env.ENV_GUGU_ID, this.honoctx.env.ENV_GUGU_AK);

		this.on(':text', async (ctx: Filter<BotContext, 'message:text'>) => {
			if (ctx.msg.text.length > ctx.session.textlimit) {
				await ctx.reply('Text length limit exceeded.');
				return;
			}
			const content = BasePrintFormatter.formatraw(ctx.msg.text);
			const formatted = await new TextPrintFormatter().format(ctx, content);
			await this.doprint(ctx, formatted);
		});
		this.on(':photo', async (ctx: Filter<BotContext, 'message:photo'>) => {
			const file = await ctx.getFile();
			const filecontent = await new RawTelegramApi(this.honoctx.env.ENV_BOT_TOKEN).getFileContent(file.file_path);
			const supported: string[] = ['image/png', 'image/jpeg', 'image/gif', 'image/tiff'];
			const filetype = await fileTypeFromBuffer(filecontent);
			if (!filetype || !supported.includes(filetype.mime)) {
				await ctx.reply(`Unsupported image type: ${filetype?.mime}`);
				return;
			}
			const content = await this.guguapi.processpic(filecontent);
			const formatted = await new PhotoPrintFormatter().format(ctx, content);
			await this.doprint(ctx, formatted);
		});
		this.on(':sticker', async (ctx: Filter<BotContext, 'message:sticker'>) => {
			const file = await ctx.getFile();
			const filecontent = await new RawTelegramApi(this.honoctx.env.ENV_BOT_TOKEN).getFileContent(file.file_path);
			const supported: string[] = ['image/png', 'image/jpeg', 'image/gif', 'image/tiff'];
			const filetype = await fileTypeFromBuffer(filecontent);
			if (!filetype || !supported.includes(filetype.mime)) {
				await ctx.reply(`Unsupported sticker type: ${filetype?.mime}`);
				return;
			}
			const content = await this.guguapi.processpic(filecontent);
			const formatted = await new StickerPrintFormatter().format(ctx, content);
			await this.doprint(ctx, formatted);
		});
		this.on(':file', async (ctx: Filter<BotContext, 'message:file'>) => {
			const file = await ctx.getFile();
			const max_file_size = 1024 * 1024 * 16;
			if (file.file_size && file.file_size > max_file_size) {
				await ctx.reply(`File too large: ${file.file_size} bytes > ${max_file_size} bytes`);
				return;
			}
			const filecontent = await new RawTelegramApi(this.honoctx.env.ENV_BOT_TOKEN).getFileContent(file.file_path);
			const supported: string[] = ['image/png', 'image/jpeg', 'image/gif', 'image/tiff'];
			const filetype = await fileTypeFromBuffer(filecontent);
			if (!filetype || !supported.includes(filetype.mime)) {
				await ctx.reply(`Unsupported file type: ${filetype?.mime}`);
				return;
			}
			const content = await this.guguapi.processpic(filecontent);
			const formatted = await new StickerPrintFormatter().format(ctx, content);
			await this.doprint(ctx, formatted);
		});
		this.on(':checklist', async (ctx: Filter<BotContext, 'message:checklist'>) => {
			const output_all = ChecklistPrintFormatter.parse(ctx.msg.checklist);
			if (output_all.length > ctx.session.textlimit) {
				await ctx.reply('Text length limit exceeded.');
				return;
			}
			const content = BasePrintFormatter.formatraw(output_all);
			const formatted = await new ChecklistPrintFormatter().format(ctx, content);
			await this.doprint(ctx, formatted);
		});

		this.on(':location', async (ctx: Filter<BotContext, 'message:location'>) => {
			const output_all = LocationPrintFormatter.parse(ctx.msg.location);
			const content = BasePrintFormatter.formatraw(output_all);
			const formatted = await new LocationPrintFormatter().format(ctx, content);
			await this.doprint(ctx, formatted);
		});

		this.on(':contact', async (ctx: Filter<BotContext, 'message:contact'>) => {
			const output_all = ContactPrintFormatter.parse(ctx.msg.contact);
			if (output_all.length > ctx.session.textlimit) {
				await ctx.reply('Text length limit exceeded.');
				return;
			}
			const content = BasePrintFormatter.formatraw(output_all);
			const formatted = await new ContactPrintFormatter().format(ctx, content);
			await this.doprint(ctx, formatted);
		});
	}
}

export default PrintComposer;
