import { type ValidationError, type ValidationErrors, type ValidationWithErrors } from '../types/errorsTypes';
import { type FormErrors } from '../types/formTypes';

export const formatErrors = <T extends Record<string, any>> (
	errors: ValidationErrors = {} as ValidationErrors 
) => {
	return errors
	.reduce<FormErrors<T>>((obj, value) => {
		const path = value.path as keyof typeof obj;

		if ( !obj[path] ) {
			obj[path] = [];
		}

		obj[path].push(...(value as ValidationError).error !== undefined ? [(value as ValidationError).error] : (value as ValidationWithErrors).errors);

		obj[path] = Array.from(new Set(obj[path]));

		return obj;
	}, {});
};
