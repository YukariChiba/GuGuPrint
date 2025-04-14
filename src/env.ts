import * as process from 'node:process';

async function setEnv(env: Env) {
	process.env.ENV_BOT_SECRET ??= env.ENV_BOT_SECRET;
	process.env.ENV_BOT_TOKEN ??= env.ENV_BOT_TOKEN;
	process.env.ENV_GUGU_API ??= env.ENV_GUGU_API;
	process.env.ENV_GUGU_ID ??= env.ENV_GUGU_ID;
	process.env.ENV_GUGU_AK ??= env.ENV_GUGU_AK;
}

export { setEnv };
