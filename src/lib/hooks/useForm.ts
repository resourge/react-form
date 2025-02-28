import {
	type ChangeEvent,
	type FormEvent,
	useRef,
	useState
} from 'react';

import { type FieldForm, type ResetMethod } from '../types';
import { type FormKey } from '../types/FormKey';
import { type ValidationErrors } from '../types/errorsTypes';
import {
	type FieldFormReturn,
	type FieldOptions,
	type FormOptions,
	type SubmitHandler,
	type Touches,
	type UseFormReturn,
	type ValidateSubmissionErrors
} from '../types/formTypes';
import { isClass } from '../utils/utils';

import { useErrors } from './useErrors';
import { useProxy } from './useProxy';
import { useWatch } from './useWatch';

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
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setState] = useState(0);
	const forceUpdate = () => setState((x) => x + 1);
	const touchesRef = useRef<Touches>(new Map());
	const preventStateUpdateRef = useRef<boolean>(false);

	const stateRef = useProxy<T>(
		() => (
			typeof defaultValue === 'function' 
				? (
					isClass(defaultValue) 
						? new (defaultValue as new () => T)() 
						: (defaultValue as () => T)()
				) : defaultValue
		),
		async (key, metadata) => {
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

			for (const [watchedKey, method] of watchedRefs.current) {
				if ( watchedKey === key ) {
					const res = method(stateRef.current);

					if ( res instanceof Promise ) {
						// eslint-disable-next-line no-await-in-loop
						await res;
					}
				}
			}

			options.onChange?.(stateRef.current);

			if ( !preventStateUpdateRef.current ) {
				forceUpdate();
			}
		},
		(key: string) => Array.from(touchesRef.current).filter(([touchKey]) => touchKey.startsWith(key))
	);

	const {
		errorRef,
		changedKeysRef, 
		changedKeys,
		
		hasError,
		getErrors,
		validateSubmission,
		changeTouch, 
		clearTouches,
		setError,
		hasTouch
	} = useErrors<T>({
		touchesRef,
		stateRef,
		validate: (changedKeys) => validateState(
			stateRef.current,
			changedKeys,
			options.validate
		),
		forceUpdate,
		validationType: options.validationType
	});

	const {
		watch,
		watchedRefs,
		onSubmitWatch
	} = useWatch<T>();

	const handleSubmit = <K = void>(
		onValid: SubmitHandler<T, K>,
		validateErrors?: ValidateSubmissionErrors,
		filterKeysError?: (key: string) => boolean
	) => async (e?: FormEvent<HTMLFormElement> | React.MouseEvent<any, React.MouseEvent> | React.BaseSyntheticEvent) => {
		e?.preventDefault?.();

		// This serves so onlyOnTouch validations still work on handleSubmit
		changedKeysRef.current.add('*' as FormKey<T>);

		await validateSubmission(validateErrors, filterKeysError);

		options.onSubmit?.(stateRef.current);

		const result = await onValid(stateRef.current);

		await onSubmitWatch(stateRef.current);

		return result;
	};

	const reset: ResetMethod<T> = (
		newFrom, 
		resetOptions = {}
	) => {
		preventStateUpdateRef.current = true;

		(Object.keys(newFrom) as Array<keyof T>)
		.forEach((key) => stateRef.current[key] = newFrom[key] as T[keyof T]);

		if ( resetOptions.clearTouched ?? true ) {
			clearTouches();
		}
		forceUpdate();

		preventStateUpdateRef.current = false;
	};

	const onChange = (
		key: FormKey<T>,
		onChange?: (value: any) => any
	) => (value: T[FormKey<T>] | ChangeEvent) => {
		const _value = (
			(value as ChangeEvent<HTMLInputElement> & { nativeEvent?: { text?: string } })?.nativeEvent?.text
			?? (value as ChangeEvent<HTMLInputElement>)?.currentTarget?.value
			?? value
		);

		stateRef.current[key] = onChange ? onChange(_value) : _value as T[FormKey<T>];
	};

	const field = ((
		key: FormKey<T>, 
		fieldOptions: FieldOptions = {}
	): FieldFormReturn => {
		const value = stateRef.current[key];

		if ( fieldOptions.readOnly ) {
			return {
				name: key,
				readOnly: true,
				value
			};
		}
		
		const _onChange = onChange(key, fieldOptions.onChange);

		if ( fieldOptions.blur ) {
			return {
				name: key,
				onChange: (value: T[FormKey<T>] | ChangeEvent) => {
					preventStateUpdateRef.current = true;

					_onChange(value);

					preventStateUpdateRef.current = false;
				},
				onBlur: () => hasTouch(key) && forceUpdate(),
				defaultValue: value
			};
		}

		return {
			name: key,
			onChange: _onChange,
			value
		};
	}) as FieldForm<T>;

	return {
		form: stateRef.current,
		get context() {
			return this;
		},
		get errors() {
			return errorRef.current['' as FormKey<T>]?.childFormErrors ?? {};
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
		triggerChange: async (cb) => {
			preventStateUpdateRef.current = true;
			try {
				await cb(stateRef.current);
				forceUpdate();
			}
			finally {
				preventStateUpdateRef.current = false;
			}
		},
		handleSubmit,
		setError,
		hasTouch,
		hasError,
		getErrors,

		// @ts-expect-error changedKeys for UseFormReturnController
		changedKeys,

		reset,
		changeValue: (key, value) => stateRef.current[key] = value,
		getValue: (key) => stateRef.current[key],

		resetTouch: () => {
			clearTouches();

			forceUpdate();
		},
		watch,
		updateController: changeTouch,
		// #endregion Form actions
		toJSON() {
			return {
				...this,
				get context() {
					return 'To Prevent circular dependency';
				}
			};
		}
	};
}
