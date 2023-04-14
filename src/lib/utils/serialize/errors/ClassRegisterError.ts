export class ClassRegisterError extends Error {
	constructor(errorClassName: string) {
		super(`${errorClassName} class is missing.`)

		this.name = 'ClassRegisterError';

		this.cause = 'Q'

		Error.captureStackTrace(this, ClassRegisterError);
	}
}
