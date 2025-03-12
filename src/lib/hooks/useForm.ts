import { type FormEvent } from 'react';

import { type FormKey } from '../types/FormKey';
import { type ValidationErrors } from '../types/errorsTypes';
import {
	type FormOptions,
	type SubmitHandler,
	type UseFormReturn,
	type ValidateSubmissionErrors
} from '../types/formTypes';

import { useErrors } from './useErrors';
import { useProxy } from './useProxy';
import { useTouches } from './useTouches';

/**
 * Validates the form
 * @param state Current State
 * @returns New validated state
 */
const validateState = <T extends Record<string, any>>(
	form: T,
	changedKeys: Array<FormKey<T>>,
	validate: FormOptions<T>['validate']
): ValidationErrors | Promise<ValidationErrors> => {
	// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
	const handleSuccess = (errors: void | ValidationErrors): ValidationErrors => {
		if ( errors && errors.length ) {
			// eslint-disable-next-line @typescript-eslint/no-throw-literal, @typescript-eslint/only-throw-error
			throw errors;
		}

		return [];
	};

	try {
		const result = validate?.(form, changedKeys);

		return result instanceof Promise
			? result.then(handleSuccess)
			: handleSuccess(result);
	}
	catch ( err ) {
		if ( err && Array.isArray(err) ) {
			return err;
		}
		throw err as Error;
	}
};

export function useForm<T extends Record<string, any>>(
	defaultValue: new() => T, 
	options?: FormOptions<T>
): UseFormReturn<T>;
export function useForm<T extends Record<string, any>>(
	defaultValue: () => T, 
	options?: FormOptions<T>
): UseFormReturn<T>;
export function useForm<T extends Record<string, any>>(
	defaultValue: T, 
	options?: FormOptions<T>
): UseFormReturn<T>;
export function useForm<T extends Record<string, any>>(
	defaultValue: T | (() => T) | ((new() => T)), 
	options: FormOptions<T> = {}
): UseFormReturn<T> {
	const {
		touchesRef, shouldUpdateErrorsRef, changedKeysRef, 

		changeTouch, hasTouch, 
		setTouch, getTouch
	} = useTouches<T>({
		validationType: options.validationType
	});

	const {
		form, changeValue, getValue, field, reset, update, onKeyTouch
	} = useProxy<T>({
		hasTouch,
		touchesRef,
		defaultValue,
		onKeyTouch: async (key, metadata) => {
			if ( metadata?.isArray ) {
				metadata.touch?.touch
				.forEach(([oldKey, value]) => {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					touchesRef.current.set(oldKey.replace(metadata.touch!.key, key), value);
				});
				if (!metadata.touch) {
					touchesRef.current
					.forEach((_, touchKey) => {
						if ( touchKey.startsWith(key) ) {
							touchesRef.current.delete(touchKey);
						}
					});
				}
			}

			changeTouch(
				key as FormKey<T>, 
				(metadata && metadata.isArray ? hasTouch(key as FormKey<T>) : undefined)
			);

			if ( options.watch ) {
				for (const watchKey of Object.keys(options.watch)) {
					if ( watchKey === key ) {
						const watch = options.watch[watchKey as FormKey<T>];
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						const res = watch!(form);

						if ( res instanceof Promise ) {
						// eslint-disable-next-line no-await-in-loop
							await res;
						}
					}
				}
			}

			options.onChange?.(form);
		}
	});

	const {
		errorRef,
		changedKeys,
		
		hasError,
		getErrors,
		validateSubmission,
		setError
	} = useErrors<T>({
		touchesRef,
		form,
		validate: (changedKeys) => validateState(
			form,
			changedKeys,
			options.validate
		),
		update,
		validationType: options.validationType,
		changedKeysRef,
		getTouch,
		setTouch,
		shouldUpdateErrorsRef
	});

	const handleSubmit = <K = void>(
		onValid: SubmitHandler<T, K>,
		validateErrors?: ValidateSubmissionErrors,
		filterKeysError?: (key: string) => boolean
	) => async (e?: FormEvent<HTMLFormElement> | React.MouseEvent<any, React.MouseEvent> | React.BaseSyntheticEvent) => {
		e?.preventDefault?.();

		// This serves so onlyOnTouch validations still work on handleSubmit
		changedKeysRef.current.add('*' as FormKey<T>);

		await validateSubmission(validateErrors, filterKeysError);

		options.onSubmit?.(form);

		return await onValid(form);
	};
	
	return {
		form,
		get context() {
			return this;
		},
		get errors() {
			return errorRef.current['' as FormKey<T>]?.formErrors ?? {};
		},
		get isValid(): boolean {
			return !hasError('' as FormKey<T>, {
				includeChildsIntoArray: true 
			});
		},
		get isTouched() {
			return hasTouch('');
		},
		field,
		handleSubmit,
		setError,
		hasTouch,
		hasError,
		getErrors,

		// @ts-expect-error changedKeys for UseFormReturnController
		changedKeys,

		reset,
		changeValue,
		getValue,

		resetTouch: () => {
			touchesRef.current.clear();

			update();
		},
		updateController: changeTouch,
		// #endregion Form actions
		toJSON() {
			return {
				...this,
				get context() {
					return 'To Prevent circular dependency';
				}
			};
		},
		type: 'form',
		_options: {
			touchesRef,
			onKeyTouch
		}
	};
}
