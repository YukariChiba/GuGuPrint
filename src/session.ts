interface SessionData {
	verified: boolean;
	whitelist: boolean;
	whitelistreq: boolean;
	limit: number;
	limit_used: number;
	textlimit: number;
	lastprint: number;
}

const defaultSessionData: SessionData = {
	verified: false,
	whitelist: false,
	whitelistreq: false,
	limit: 3,
	limit_used: 0,
	textlimit: 400,
	lastprint: 0,
};

export type { SessionData };
export { defaultSessionData };
