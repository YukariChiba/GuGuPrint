type Bindings = {
	KV: KVNamespace;
	ENV_BOT_TOKEN: string;
	ENV_GUGU_API: string;
	ENV_GG_ELE_KEY: string;
	ENV_GG_GEO_KEY: string;
	ENV_GUGU_AK: string;
	ENV_GUGU_ID: string;
	ENV_ADMIN_ID: number;
	GITHUB_ID: string;
	GITHUB_SECRET: string;
};

type HonoEnv = {
	Bindings: Bindings;
};

export default HonoEnv;
