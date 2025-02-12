import { type FormKey } from '../types';
import { type ValidationWithErrors, type ValidationErrors } from '../types/errorsTypes';
import { type FormError, type FormErrors } from '../types/formTypes';

function addErrorToFormErrors<T extends Record<string, any>>(
	formErrors: FormErrors<T>, 
	path: string, 
	validationError: ValidationWithErrors,
	isChildError = false
) {
	const entry = formErrors[path as FormKey<T>] ||= ({
		errors: [],
		childErrors: [],
		childErrorsObj: {
			toJSON: () => ({})
		}
	} as unknown as FormError<T[FormKey<T>]>);

	validationError.errors.forEach((message) => {
		if ( !isChildError ) {
			if ( !entry.errors.includes(message) ) {
				entry.errors.push(message);
			}
		}
		else if ( !entry.childFormErrors[validationError.path as T[FormKey<T>]] ) {
			entry.childFormErrors[validationError.path as T[FormKey<T>]] = formErrors[validationError.path as FormKey<T>];
		}

		if ( !entry.childErrors.includes(message) ) {
			entry.childErrors.push(message);
		}
	});
}

export const forEachPossibleKey = (key: string, onKey: (key: string) => void) => {
	(
		key.match(/(?:\.\w+|\[\d+\]|\w+)/g) ?? []
	).forEach((_, index, arr) => onKey(arr.slice(0, arr.length - index).join('')));

	onKey('');
};

export const getErrorsFromValidationErrors = (value: ValidationErrors[number]): ValidationWithErrors => {
	return {
		path: value.path,
		errors: 'error' in value ? [value.error] : value.errors
	};
};

export const formatErrors = <T extends Record<string, any>>(
	errors: ValidationErrors = {} as ValidationErrors
) => {
	return errors
	.reduce<FormErrors<T>>((val, value) => {
		const key = value.path;
		const errors = getErrorsFromValidationErrors(value);

		forEachPossibleKey(key, (possibilityKey) => addErrorToFormErrors(val, possibilityKey, errors, key !== possibilityKey));

		return val;
	}, {});
};
