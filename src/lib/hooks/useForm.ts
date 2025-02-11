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
	type UseFormReturn,
	type ValidateSubmission
} from '../types/formTypes';
import { formatErrors } from '../utils/formatErrors';
import { isClass, isObjectOrArray } from '../utils/utils';

import { useErrors } from './useErrors';
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
): ValidationErrors | Promise<ValidationErrors> => {
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

function deepObjectToMap(obj: any, parentKey: string = '', map = new Map<string, any>()) {
	if ( isObjectOrArray(obj) ) {
		if (Array.isArray(obj)) {
			obj.forEach((item, index) => deepObjectToMap(item, `${parentKey}[${index}]`, map));
		}
		else {
			Object.entries(obj)
			.forEach(([key, value]) => deepObjectToMap(value, parentKey ? `${parentKey}.${key}` : key, map));
		}
	}

	if ( parentKey ) {
		map.set(parentKey, obj);
	}

	return map;
}

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
			updateTouches(key as FormKey<T>);

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
		changedKeysRef, touchesRef, updateTouches, clearTouches
	} = useTouches<T>();

	const changedKeys = Array.from<FormKey<T>>(changedKeysRef.current);

	const {
		errorRef,
		validationErrorsRef,
		getErrors,
		updateErrors,
		validateForm
	} = useErrors<T>({
		touchesRef,
		changedKeys,
		canValidate: (options.validateOnlyAfterFirstSubmit !== false ? firstSubmitRef.current : true),
		splitterOptionsRef,
		validate: () => validateState(
			stateRef.current,
			Array.from(changedKeysRef.current),
			options.validate
		),
		forceUpdate,
		updateTouches,
		firstSubmitRef
	});

	const {
		watch,
		watchedRefs,
		onSubmitWatch
	} = useWatch<T>();

	const handleSubmit = <K = void>(
		onValid: SubmitHandler<T, K>,
		onInvalid?: ValidateSubmission,
		filterKeysError?: (key: string) => boolean
	) => async (e?: FormEvent<HTMLFormElement> | React.MouseEvent<any, React.MouseEvent> | React.BaseSyntheticEvent) => {
		splitterOptionsRef.current.filterKeysError = filterKeysError;
		try {
			e?.preventDefault?.();
			firstSubmitRef.current = true;

			// This serves so onlyOnTouch validations still work on handleSubmit
			changedKeysRef.current.add('*' as FormKey<T>);

			const errors = await validateForm();
			options.onSubmit?.(stateRef.current, errorRef.current);

			if ( Object.keys(errors).length ) {
				const canGoOn = onInvalid
					? await Promise.resolve(onInvalid(formatErrors(errors)))
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

		stateRef.current[key] = _value;

		splitterOptionsRef.current = {};
	};

	const getValue = (key: FormKey<T>) => stateRef.current[key];

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
		) => {
			firstSubmitRef.current = true;

			newErrors.forEach(({ path }) => {
				touchesRef.current[path] = {};
			});

			updateErrors([
				...validationErrorsRef.current,
				...newErrors
			]);
		},
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
