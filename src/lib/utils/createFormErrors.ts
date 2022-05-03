import { FormErrors } from '../types';
import { OnErrors, ValidationErrors } from '../validators/setDefaultOnError';

import { createNestedObject } from './createNestedObject';
import { getKeyFromPaths } from './utils';

export const getFormErrorsDefault = () => ({
	simpleErrors: {},
	errors: {}
})

export const formatErrors = <T extends Record<string, any>> (errors: ValidationErrors, defaultErrors: FormErrors<T> = getFormErrorsDefault()) => {
	return errors
	.reduce<FormErrors<T>>((obj, value) => {
		const keys = Array.isArray(value.path) ? value.path : value.path.split('.')
		.map((key: string) => 
			key
			.split('[')
			.map((arrayKey) => arrayKey.replace(']', ''))
		)
		.flat();

		createNestedObject(obj.errors, [...keys], {
			errors: value.errors
		})

		const path = getKeyFromPaths<T>(keys);

		obj.simpleErrors[path] = value.errors;

		return obj
	}, defaultErrors);
}

export const createFormErrors = <T extends Record<string, any>>(onError: OnErrors) => 
	(errors: any, defaultErrors: FormErrors<T> = getFormErrorsDefault()) => {
		return formatErrors<T>(onError(errors), defaultErrors)
	}
