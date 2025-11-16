import { Context as GrammyContext, SessionFlavor } from 'grammy';
import { SessionData } from './session';
import { Context as HonoContext } from 'hono';
import HonoEnv from './bindings';

type BotContext = GrammyContext & SessionFlavor<SessionData>;
type ServerContext = HonoContext<HonoEnv>;

export type { BotContext, ServerContext };
