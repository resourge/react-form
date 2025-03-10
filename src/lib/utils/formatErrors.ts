import { type FormKey } from '../types';
import { type ValidationErrors, type ValidationError } from '../types/errorsTypes';
import { type FormError, type FormErrors } from '../types/formTypes';

type PrevFormError<T extends Record<string, any>> = {
	entry: FormError<T[FormKey<T>]>
	path: string
};

function addErrorToFormErrors<T extends Record<string, any>>(
	formErrors: FormErrors<T>, 
	path: string, 
	validationError: ValidationError,
	isChildError = false,
	prev?: PrevFormError<T>
): PrevFormError<T> {
	const entry: FormError<T[FormKey<T>]> = formErrors[path as FormKey<T>] ||= {
		form: {
			errors: [],
			child: []
		},
		every: {
			errors: [],
			child: []
		},
		formErrors: {},
		// @ts-expect-error To prevent circular dependency
		toJSON() {
			return {
				form: this.form,
				every: this.every
			};
		}
	};

	if ( prev ) {
		entry.formErrors = {
			...entry.formErrors,
			...prev.entry.formErrors,
			[prev.path]: prev.entry
		};
	}

	const message = validationError.error;
	if ( !isChildError ) {
		entry.every.errors.push(message);
		if ( !entry.form.errors.includes(message) ) {
			entry.form.errors.push(message);
		}
	}

	entry.every.child.push(message);
	if ( !entry.form.child.includes(message) ) {
		entry.form.child.push(message);
	}

	return {
		path, 
		entry
	};
}

export const forEachPossibleKey = (key: string, onKey: (key: string) => void) => {
	(
		key.match(/(?:\.\w+|\[\d+\]|\w+)/g) ?? []
	).forEach((_, index, arr) => onKey(arr.slice(0, arr.length - index).join('')));

	onKey('');
};

export const formatErrors = <T extends Record<string, any>>(
	errors: ValidationErrors = {} as ValidationErrors
) => {
	return errors
	.reduce<FormErrors<T>>((val, value) => {
		let prev: PrevFormError<T> | undefined;
		
		forEachPossibleKey(value.path, (possibilityKey) => {
			prev = addErrorToFormErrors(val, possibilityKey, value, value.path !== possibilityKey, prev);
		});

		return val;
	}, {});
};
