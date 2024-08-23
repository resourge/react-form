/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/prefer-function-type */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import {
	type ChangeEvent,
	type FormEvent,
	useRef,
	useState
} from 'react';

import { type FieldForm, type FormErrors, type ResetMethod } from '../types';
import { type FormKey } from '../types/FormKey';
import { type ValidationWithErrors, type ValidationErrors } from '../types/errorsTypes';
import {
	type FieldFormReturn,
	type FieldOptions,
	type FormOptions,
	type OnFunctionChange,
	type SplitterOptions,
	type SubmitHandler,
	type UseFormReturn,
	type ValidateSubmission
} from '../types/formTypes';
import { formatErrors } from '../utils/createFormErrors';
import { observeObject } from '../utils/observeObject/observeObject';
import { filterKeys, isClass } from '../utils/utils';

import { useErrors } from './useErrors';
import { useGetterSetter } from './useGetterSetter';
import { useTouches } from './useTouches';
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
): FormErrors<T> | Promise<FormErrors<T>> => {
	const onSuccess = (errors: void | ValidationErrors): FormErrors<T> => {
		if ( errors && errors.length ) {
			// eslint-disable-next-line @typescript-eslint/no-throw-literal, @typescript-eslint/only-throw-error
			throw errors;
		}

		return {};
	};

	try {
		const result = validate && validate(form, changedKeys);

		if ( result instanceof Promise ) {
			return result
			.then(onSuccess)
			.catch(formatErrors);
		}

		return onSuccess(result);
	}
	catch ( err ) {
		return formatErrors(err as ValidationErrors);
	}
};

export function useForm<T extends Record<string, any>>(
	defaultValue: { new(): T }, 
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
	defaultValue: T | (() => T) | ({ new(): T }), 
	options: FormOptions<T> = {}
): UseFormReturn<T> {
	const _state = useState(0);
	const forceUpdate = () => _state[1]((x) => x + 1);

	// #region State

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const stateRef = useRef<T>(undefined!);
	
	if ( !stateRef.current ) {
		stateRef.current = (() => {
			return observeObject(
				typeof defaultValue === 'function' 
					? (
						isClass(defaultValue) 
							? new (defaultValue as new () => T)() 
							: (defaultValue as () => T)()
					) : defaultValue,
				async (key) => {
					updateTouches(key);

					if ( watchedRefs.current.size ) {
						for (const [watchedKey, method] of watchedRefs.current) {
							if ( watchedKey === key ) {
								const res = method(stateRef.current);

								if ( res instanceof Promise ) {
									// eslint-disable-next-line no-await-in-loop
									await res;
								}
							}
						}
					}

					if ( options.onChange ) {
						options.onChange(
							stateRef.current,
							{
								errors: errorRef.current,
								touches: touchesRef.current
							}
						);
					}

					if ( !splitterOptionsRef.current.preventStateUpdate ) {
						forceUpdate();
					}
				}
			);
		})();
	}
	// #endregion State
	const firstSubmitRef = useRef(false);
	const splitterOptionsRef = useRef<SplitterOptions & { preventStateUpdate?: boolean }>({});

	const {
		changedKeys, touchesRef, updateTouches, clearTouches, setCache
	} = useTouches<T>();

	const {
		errorRef,
		hasError,
		getErrors,
		updateErrors,
		validateForm
	} = useErrors({
		changedKeys,
		setCache,
		canValidate: (options.validateOnlyAfterFirstSubmit !== false ? firstSubmitRef.current : true),
		validate: () => {
			const validateStateResult = validateState(
				stateRef.current,
				changedKeys,
				options.validate
			);

			if ( validateStateResult instanceof Promise ) {
				return validateStateResult.then((errors) => {
					return filterKeys<T>(
						errors,
						splitterOptionsRef.current.filterKeysError 
					);
				});
			}

			return filterKeys<T>(
				validateStateResult,
				splitterOptionsRef.current.filterKeysError 
			);
		},
		updateTouches,
		touchesRef,
		forceUpdate
	});

	const getterSetter = useGetterSetter<T>();

	const {
		watch,
		watchedRefs,
		onSubmitWatch
	} = useWatch<T>();

	/**
	 * Handles the form submit
	 */
	const handleSubmit = <K = void>(
		onValid: SubmitHandler<T, K>,
		onInvalid?: ValidateSubmission<T>,
		filterKeysError?: (key: string) => boolean
	) => async (e?: FormEvent<HTMLFormElement> | React.MouseEvent<any, React.MouseEvent> | React.BaseSyntheticEvent) => {
		splitterOptionsRef.current.filterKeysError = filterKeysError;
		try {
			if ( e ) {
				e.preventDefault();
				e.persist();
			}

			firstSubmitRef.current = true;

			const errors = await validateForm();

			if ( options.onSubmit ) {
				options.onSubmit(
					stateRef.current, 
					{
						errors: errorRef.current,
						touches: touchesRef.current
					}
				);
			}

			if ( Object.keys(errors).length ) {
				const canGoOn = onInvalid
					? await Promise.resolve(onInvalid(errors, errors))
					: false;

				if ( !canGoOn ) {
					return await Promise.reject(errors);
				}
			}
		
			const result = await onValid(stateRef.current);

			await onSubmitWatch(stateRef.current);

			return result;
		}
		finally {
			splitterOptionsRef.current = {};
		}
	};

	// #region State
	const reset: ResetMethod<T> = (
		newFrom, 
		resetOptions = {}
	) => {
		splitterOptionsRef.current = resetOptions;

		splitterOptionsRef.current.preventStateUpdate = true;

		(Object.keys(newFrom) as Array<keyof T>)
		.forEach((key) => {
			stateRef.current[key as keyof T] = newFrom[key] as T[keyof T];
		});

		if ( resetOptions.clearTouched ?? true ) {
			clearTouches();
		}
		forceUpdate();

		splitterOptionsRef.current = {};
	};

	const triggerChange = async (cb: OnFunctionChange<T>, produceOptions: SplitterOptions = {}) => {
		splitterOptionsRef.current = produceOptions;
		try {
			splitterOptionsRef.current.preventStateUpdate = true;
			await Promise.resolve(cb(stateRef.current));
			forceUpdate();
		}
		finally {
			splitterOptionsRef.current = {};
		}
	};

	const resetTouch = () => {
		clearTouches();

		forceUpdate();
	};
	// #endregion State

	// #region Form elements
	const onChange = (
		key: FormKey<T>, 
		fieldOptions: FieldOptions = {}
	) => (value: T[FormKey<T>] | ChangeEvent) => {
		let _value: T[FormKey<T>] = value as T[FormKey<T>];

		const target = value && (value as ChangeEvent<HTMLInputElement>).currentTarget;

		if ( 
			target 
			&& target.tagName 
			&& (
				target.tagName.toLocaleUpperCase() === 'INPUT' 
				|| target.tagName.toLocaleUpperCase() === 'TEXTAREA'
				|| target.tagName.toLocaleUpperCase() === 'SELECT'
			) 
		) {
			_value = target.value as T[FormKey<T>];
		}

		const nativeEvent = value && (value as ChangeEvent<HTMLInputElement>).nativeEvent;

		const nativeValue = nativeEvent 
			? (nativeEvent as unknown as { text: any }).text 
			: undefined;

		if (nativeValue !== undefined) {
			_value = nativeValue;
		}

		splitterOptionsRef.current = fieldOptions;

		getterSetter.set(key, stateRef.current, _value);

		splitterOptionsRef.current = {};
	};

	const getValue = (key: FormKey<T>) => getterSetter.get(key, stateRef.current);

	const field = ((
		key: FormKey<T>, 
		fieldOptions: FieldOptions = {}
	): FieldFormReturn => {
		const value = getValue(key);

		if ( fieldOptions.blur ) {
			return {
				name: key,
				onChange: onChange(key, {
					...fieldOptions,
					// @ts-expect-error fieldOptions if going to change splitterOptionsRef, and that is where preventStateUpdate is going
					preventStateUpdate: true
				}),
				onBlur: () => {
					if ( touchesRef.current[key] ) {
						forceUpdate();
					}
				},
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

	const changeValue = (
		key: FormKey<T>, 
		value: T[FormKey<T>], 
		produceOptions?: FieldOptions
	) => onChange(key, produceOptions)(value);
	// #endregion Form elements

	// #region Errors
	const setError = (
		newErrors: Array<{
			errors: string[]
			path: FormKey<T>
		}>
	) => updateErrors(
		formatErrors([
			...Object.entries(errorRef.current)
			.map(([path, errors]) => ({
				path,
				errors
			})) as ValidationWithErrors[],
			...newErrors
		])
	);
	// #endregion Errors

	return {
		form: stateRef.current,
		get context() {
			return this;
		},
		errors: errorRef.current,
		get isValid(): boolean {
			return Object.keys(this.errors).length === 0;
		},
		touches: touchesRef.current,
		get isTouched() {
			return Object.keys(this.touches).length !== 0;
		},
		// #region Form actions
		field,
		triggerChange,
		handleSubmit,

		setError,
		hasError,
		getErrors,

		// @ts-expect-error changedKeys for UseFormReturnController
		changedKeys,

		reset,
		onChange,
		changeValue,
		getValue,

		resetTouch,
		watch,
		updateController: (key) => {
			updateTouches(key);
		},
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
