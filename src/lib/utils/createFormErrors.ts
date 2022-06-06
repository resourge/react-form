/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { FormErrors } from '../types/types';
import { OnErrors, ValidationError, ValidationErrors, ValidationWithErrors } from '../validators/setDefaultOnError';

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

		obj[path] = (value as ValidationError).error ? [(value as ValidationError).error] : (value as ValidationWithErrors).errors;

		return obj
	}, {});

	return {
		...defaultErrors,
		..._simpleErrors
	}
}

export const createFormErrors = <T extends Record<string, any>>(onError: OnErrors) => 
	(errors: any, defaultErrors: FormErrors<T> = {}) => {
		return formatErrors<T>(onError(errors), defaultErrors)
	}
