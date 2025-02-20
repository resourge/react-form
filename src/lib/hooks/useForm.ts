import {
	type ChangeEvent,
	type FormEvent,
	useRef,
	useState
} from 'react';

import { type FieldForm, type GetErrorsOptions, type ResetMethod } from '../types';
import { type FormKey } from '../types/FormKey';
import { type ValidationErrors } from '../types/errorsTypes';
import {
	type FieldFormReturn,
	type FieldOptions,
	type FormOptions,
	type OnFunctionChange,
	type SplitterOptions,
	type SubmitHandler,
	type Touches,
	type UseFormReturn,
	type ValidateSubmission
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
		return err as ValidationErrors;
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

			options.onChange?.(stateRef.current, errorRef.current);

			if ( !splitterOptionsRef.current.preventStateUpdate ) {
				forceUpdate();
			}
		},
		(key: string) => Array.from(touchesRef.current).filter(([touchKey]) => touchKey.startsWith(key))
	);

	const splitterOptionsRef = useRef<SplitterOptions & { preventStateUpdate?: boolean }>({});

	const {
		errorRef,
		changedKeysRef, 
		changedKeys,
		
		getErrors,
		submitValidation,
		changeTouch, 
		clearTouches,
		setError,
		hasTouch
	} = useErrors<T>({
		touchesRef,
		splitterOptionsRef,
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
		onInvalid?: ValidateSubmission<T>,
		filterKeysError?: (key: string) => boolean
	) => async (e?: FormEvent<HTMLFormElement> | React.MouseEvent<any, React.MouseEvent> | React.BaseSyntheticEvent) => {
		splitterOptionsRef.current.filterKeysError = filterKeysError;
		try {
			e?.preventDefault?.();

			// This serves so onlyOnTouch validations still work on handleSubmit
			changedKeysRef.current.add('*' as FormKey<T>);

			const errors = await submitValidation();
			options.onSubmit?.(stateRef.current, errors);

			if ( Object.keys(errors).length && !(await onInvalid?.(errors)) ) {
				// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
				return await Promise.reject(errors);
			}
		
			const result = await onValid(stateRef.current);

			await onSubmitWatch(stateRef.current);

			return result;
		}
		finally {
			splitterOptionsRef.current = {};
		}
	};

	const reset: ResetMethod<T> = (
		newFrom, 
		resetOptions = {}
	) => {
		splitterOptionsRef.current = resetOptions;

		splitterOptionsRef.current.preventStateUpdate = true;

		Object.assign(stateRef.current, newFrom);

		if ( resetOptions.clearTouched ?? true ) {
			clearTouches();
		}
		forceUpdate();

		splitterOptionsRef.current = {};
	};

	const onChange = (
		key: FormKey<T>, 
		fieldOptions: FieldOptions = {}
	) => (value: T[FormKey<T>] | ChangeEvent) => {
		const _value = (
			(value as ChangeEvent<HTMLInputElement> & { nativeEvent?: { text?: string } })?.nativeEvent?.text
			?? (value as ChangeEvent<HTMLInputElement>)?.currentTarget?.value
			?? value
		);

		splitterOptionsRef.current = fieldOptions;

		stateRef.current[key] = _value as T[FormKey<T>];

		splitterOptionsRef.current = {};
	};

	const field = ((
		key: FormKey<T>, 
		fieldOptions: FieldOptions = {}
	): FieldFormReturn => {
		const value = stateRef.current[key];

		if ( fieldOptions.blur ) {
			return {
				name: key,
				onChange: onChange(key, {
					...fieldOptions,
					// @ts-expect-error fieldOptions if going to change splitterOptionsRef, and that is where preventStateUpdate is going
					preventStateUpdate: true
				}),
				onBlur: () => hasTouch(key) && forceUpdate(),
				defaultValue: value
			};
		}

		if ( fieldOptions.readOnly ) {
			return {
				name: key,
				readOnly: true,
				value
			};
		}

		return {
			name: key,
			onChange: onChange(key, fieldOptions),
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
			return !errorRef.current['' as FormKey<T>]?.childErrors.length;
		},
		get isTouched() {
			return hasTouch('');
		},
		field,
		triggerChange: async (cb: OnFunctionChange<T>, produceOptions: SplitterOptions = {}) => {
			splitterOptionsRef.current = produceOptions;
			try {
				splitterOptionsRef.current.preventStateUpdate = true;
				await cb(stateRef.current);
				forceUpdate();
			}
			finally {
				splitterOptionsRef.current = {};
			}
		},
		handleSubmit,
		setError,
		hasTouch,
		hasError: (key: FormKey<T>, options: GetErrorsOptions = {}): boolean => !!getErrors(key, options).length,
		getErrors,

		// @ts-expect-error changedKeys for UseFormReturnController
		changedKeys,

		reset,
		onChange,
		changeValue: (
			key: FormKey<T>, 
			value: T[FormKey<T>], 
			produceOptions?: FieldOptions
		) => onChange(key, produceOptions)(value),
		getValue: (key: FormKey<T>) => stateRef.current[key],

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
