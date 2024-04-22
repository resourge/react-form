/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type ValidationError, type ValidationErrors, type ValidationWithErrors } from '../types/errorsTypes';
import { type FormErrors } from '../types/formTypes';

import { getKeyFromPaths } from './utils';

export const formatErrors = <T extends Record<string, any>> (
	errors: ValidationErrors, 
	defaultErrors: FormErrors<T> = {}
) => {
	const _simpleErrors = errors
	.reduce<FormErrors<T>>((obj, value) => {
		const keys = Array.isArray(value.path) ? value.path : value.path.split('.')
		.map((key: string) => 
			key
			.split('[')
			.map((arrayKey) => arrayKey.replace(']', ''))
		)
		.flat();

		const path = getKeyFromPaths<T>(keys);

		if ( !obj[path] ) {
			obj[path] = [];
		}

		// @ts-expect-error Can't be undefined as it will always be an array because of the previous array
		obj[path].push(...(value as ValidationError).error !== undefined ? [(value as ValidationError).error] : (value as ValidationWithErrors).errors);

		return obj;
	}, {});

	return {
		...defaultErrors,
		..._simpleErrors
	};
};
