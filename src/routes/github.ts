import { githubAuth } from '@hono-dev/auth-github';
import { Hono } from 'hono';
import HonoEnv from '../bindings';
import { SessionData } from '../session';
import GuGuBot from '../bot';
import { v4 as uuidv4 } from 'uuid';

const app = new Hono<HonoEnv>({ strict: false });

app.use('/verify/:id', githubAuth({ oauthApp: true }));
app.get('/verify/:id', async (c) => {
	const uid = c.req.param('id');
	const userinfostr = await c.env.KV.get(uid);
	if (!userinfostr) return c.status(404);
	const userinfo: SessionData = JSON.parse(userinfostr);
	if (userinfo.verified) return c.text('You are already verified.');
	const key = uuidv4();
	await c.env.KV.put(`verify-${uid}`, key);
	return c.redirect(`https://t.me/GuGuPrintBot?start=${key}`);
});

export default app;
