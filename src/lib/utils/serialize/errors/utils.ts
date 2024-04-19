import { MissingRegisterError } from './MissingRegisterError';

const errorNormalKeys = ['stack', 'message', 'cause'];

export const isError = (err: any): err is Error => {
	if ( err instanceof Error ) {
		if ( err.name === 'Error' ) {
			const keys = Object.getOwnPropertyNames(err);

			if ( !keys.some((key) => !errorNormalKeys.includes(key)) ) {
				return true;
			}
		}

		throw new MissingRegisterError(err.constructor.name);
	}
	return false;
};
