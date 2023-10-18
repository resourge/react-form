export class MissingRegisterError extends Error {
	constructor(errorClassName: string) {
		super(`Couldn't find ${errorClassName} registered. For custom Errors, it's necessary to registerClass.`);

		this.name = 'MissingRegisterError';

		this.cause = 'Q';

		Error.captureStackTrace(this, MissingRegisterError);
	}
}
