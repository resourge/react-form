/* eslint-disable @typescript-eslint/no-unused-vars */
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

import {
	type FieldForm,
	type FormErrors,
	type GetErrorsOptions,
	type ResetMethod
} from '../types';
import { type FormKey } from '../types/FormKey';
import { type ValidationErrors, type ValidationWithErrors } from '../types/errorsTypes';
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
import { isClass } from '../utils/utils';

import { useErrors } from './useErrors';
import { useGetterSetter } from './useGetterSetter';
import { useProxy } from './useProxy';
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
	const handleSuccess = (errors: void | ValidationErrors): FormErrors<T> => {
		if ( errors && errors.length ) {
			// eslint-disable-next-line @typescript-eslint/no-throw-literal, @typescript-eslint/only-throw-error
			throw errors;
		}

		return {};
	};

	try {
		const result = validate?.(form, changedKeys);

		return result instanceof Promise
			? result.then(handleSuccess).catch(formatErrors)
			: handleSuccess(result);
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
	const [_, setState] = useState(0);
	const forceUpdate = () => setState((x) => x + 1);

	const stateRef = useProxy<T>(
		() => (
			typeof defaultValue === 'function' 
				? (
					isClass(defaultValue) 
						? new (defaultValue as new () => T)() 
						: (defaultValue as () => T)()
				) : defaultValue
		),
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

			options.onChange?.(stateRef.current, errorRef.current);

			if ( !splitterOptionsRef.current.preventStateUpdate ) {
				forceUpdate();
			}
		}
	);

	const firstSubmitRef = useRef(false);
	const splitterOptionsRef = useRef<SplitterOptions & { preventStateUpdate?: boolean }>({});

	const {
		changedKeys, touchesRef, updateTouches, clearTouches
	} = useTouches<T>();

	const {
		errorRef,
		getErrors,
		updateErrors,
		validateForm
	} = useErrors({
		changedKeys,
		canValidate: (options.validateOnlyAfterFirstSubmit !== false ? firstSubmitRef.current : true),
		splitterOptionsRef,
		validate: () => validateState(
			stateRef.current,
			changedKeys,
			options.validate
		),
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

	const handleSubmit = <K = void>(
		onValid: SubmitHandler<T, K>,
		onInvalid?: ValidateSubmission<T>,
		filterKeysError?: (key: string) => boolean
	) => async (e?: FormEvent<HTMLFormElement> | React.MouseEvent<any, React.MouseEvent> | React.BaseSyntheticEvent) => {
		splitterOptionsRef.current.filterKeysError = filterKeysError;
		try {
			e?.preventDefault?.();
			firstSubmitRef.current = true;

			const errors = await validateForm();
			options.onSubmit?.(stateRef.current, errorRef.current);

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

	const reset: ResetMethod<T> = (
		newFrom, 
		resetOptions = {}
	) => {
		splitterOptionsRef.current = resetOptions;

		splitterOptionsRef.current.preventStateUpdate = true;

		(Object.keys(newFrom) as Array<keyof T>)
		.forEach((key) => stateRef.current[key as keyof T] = newFrom[key] as T[keyof T]);

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

	const onChange = (
		key: FormKey<T>, 
		fieldOptions: FieldOptions = {}
	) => (value: T[FormKey<T>] | ChangeEvent) => {
		let _value: T[FormKey<T>] = value as T[FormKey<T>];

		const target = value && (value as ChangeEvent<HTMLInputElement>).currentTarget;

		if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName.toUpperCase())) {
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
				onBlur: () => touchesRef.current[key] && forceUpdate(),
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
		errors: errorRef.current,
		get isValid(): boolean {
			return !Object.keys(errorRef.current).length;
		},
		touches: touchesRef.current as any,
		get isTouched() {
			return !!Object.keys(touchesRef.current).length;
		},
		field,
		triggerChange,
		handleSubmit,
		setError: (
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
		),
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
		getValue,

		resetTouch: () => {
			clearTouches();

			forceUpdate();
		},
		watch,
		updateController: updateTouches,
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
