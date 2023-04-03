/* eslint-disable @typescript-eslint/prefer-function-type */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import {
	type FormEvent,
	useRef,
	type MouseEvent,
	type ChangeEvent,
	useState
} from 'react'

import { shallowClone } from '@resourge/shallow-clone';
import observeChanges from 'on-change';

import { type FormContextObject } from '../contexts/FormContext';
import { type FormErrors } from '../types';
import { type FormKey } from '../types/FormKey';
import { executeWatch } from '../types/produceNewStateUtils';
import {
	type OnFunctionChange,
	type ValidateSubmission,
	type SubmitHandler,
	type FieldForm,
	type ProduceNewStateOptions,
	type FieldOptions,
	type ResetOptions,
	type FormOptions,
	type UseFormReturn,
	type Touches,
	type ProduceNewStateOptionsHistory,
	type State
} from '../types/types'
import { createFormErrors, formatErrors } from '../utils/createFormErrors';
import { getKeyFromPaths, isClass } from '../utils/utils'
import { getDefaultOnError, type ValidationErrors } from '../validators/setDefaultOnError';

import { useChangedKeys } from './useChangedKeys';
import { useErrors } from './useErrors';
import { useGetterSetter } from './useGetterSetter';
import { useWatch } from './useWatch';

export function useForm<T extends Record<string, any>>(
	defaultValue: { new(): T }, 
	options?: FormOptions<T>
): UseFormReturn<T>
export function useForm<T extends Record<string, any>>(
	defaultValue: () => T, 
	options?: FormOptions<T>
): UseFormReturn<T>
export function useForm<T extends Record<string, any>>(
	defaultValue: T, 
	options?: FormOptions<T>
): UseFormReturn<T>
export function useForm<T extends Record<string, any>>(
	defaultValue: T | (() => T) | ({ new(): T }), 
	options?: FormOptions<T>
): UseFormReturn<T> {
	// #region errors
	const onErrors = createFormErrors<T>(options?.onErrors ?? getDefaultOnError());
	// #endregion errors

	// #region State
	const [{ data: form }, setFormData] = useState<{ data: T }>(() => ({
		data: typeof defaultValue === 'function' 
			? (
				isClass(defaultValue) 
					? new (defaultValue as new () => T)() 
					: (defaultValue as () => T)()
			) : shallowClone(defaultValue)
	}));
	const [errors, setErrors] = useState<FormErrors<T>>({});
	const [touches, setTouches] = useState<Touches<T>>({});

	const stateRef = useRef<State<T>>({
		errors,
		touches,
		form
	});
	stateRef.current = {
		errors,
		touches,
		form
	};

	const _setFormState = (state: State<T>) => {
		setFormData({
			data: state.form 
		})
		setErrors(state.errors)
		setTouches(state.touches)
	}

	const setFormState = (newState: State<T>) => {
		clearCacheErrors();

		new Set([
			...Object.keys(newState.errors)
			.filter(
				(key) => !Object.keys(stateRef.current.errors)
				.includes(key)
			),
			...Object.keys(newState.touches)
			.filter(
				(key) => !Object.keys(stateRef.current.touches)
				.includes(key)
			)
		])
		.forEach((key) => {
			updateController(key as FormKey<T>)
		})

		_setFormState(newState)
	}
	// #endregion State

	const getterSetter = useGetterSetter<T>();

	const {
		watch,
		hasWatchingKeys,
		onWatch,
		onSubmitWatch
	} = useWatch();

	const {
		hasError,
		getErrors,
		clearCacheErrors
	} = useErrors(
		errors,
		touches,
		options
	)

	const [changedKeys, updateController] = useChangedKeys<T>(touches)

	/**
	 * Validates the form
	 * @param state Current State
	 * @returns New validated state
	 */
	const validateState = (state: State<T>): State<T> | Promise<State<T>> => {
		const onSuccess = (errors: void | ValidationErrors) => {
			if ( errors && errors.length ) {
				// eslint-disable-next-line @typescript-eslint/no-throw-literal
				throw errors;
			}

			return { 
				form: state.form,
				errors: {},
				touches: state.touches
			}
		}
		const onError = (err: any) => {
			const errors = onErrors(err);
			return { 
				form: state.form,
				errors,
				touches: state.touches
			}
		}

		try {
			const result = options?.validate && options?.validate(state.form, [...changedKeys.current] as Array<FormKey<T>>);

			if ( result instanceof Promise ) {
				return result
				.then(onSuccess)
				.catch(onError)
			}

			return onSuccess(result)
		}
		catch ( err ) {
			return onError(err)
		}
	}

	// #region Submit
	/**
	 * Handles the form submit
	 */
	async function onSubmit<K = void>(
		onValid: SubmitHandler<T, K>,
		onInvalid?: ValidateSubmission<T>,
		filterKeysError?: (key: string) => boolean,
		e?: FormEvent<HTMLFormElement> | MouseEvent<any, MouseEvent>
	): Promise<K | undefined> {
		const { form, touches } = stateRef.current
		if ( e ) {
			e.preventDefault();
			e.persist();
		}

		const proms = onSubmitWatch.current();

		const { errors: _errors } = await Promise.resolve(validateState(stateRef.current));

		const errors = filterKeysError ? Object.entries(_errors)
		.reduce<FormErrors<T>>((errors, [key, value]) => {
			if ( touches[key as FormKey<T>] || filterKeysError(key) ) {
				errors[key as FormKey<T>] = value as string[]
			}
			return errors;
		}, {}) : _errors

		const hasError = Object.keys(errors).length

		let _touches: Touches<T> = {}
		if ( hasError ) {
			_touches = {
				...touches 
			}

			Object.keys(errors)
			.filter((key) => !filterKeysError || filterKeysError(key))
			.forEach((key) => {
				_touches[key as keyof Touches<T>] = true;
			})
		}

		setFormState({
			form,
			errors,
			touches: _touches
		})

		if ( options?.onSubmit ) {
			options?.onSubmit({
				form,
				errors,
				touches: _touches
			});
		}

		if ( hasError ) {
			if ( onInvalid ) {
				const canGoOn = await Promise.resolve(onInvalid(errors, errors));

				if ( !canGoOn ) {
					return await Promise.reject(errors)
				}
			}
			else {
				return await Promise.reject(errors)
			}
		}
		
		const result = await onValid(form);

		await proms(form);

		return result;
	}

	function handleSubmit<K = void>(
		onValid: SubmitHandler<T, K>,
		onInvalid?: ValidateSubmission<T>,
		filterKeysError?: (key: string) => boolean
	) {
		return (e?: FormEvent<HTMLFormElement> | MouseEvent<any, MouseEvent>) => 
			onSubmit<K>(
				onValid,
				onInvalid,
				filterKeysError,
				e
			)
	}
	// #endregion Submit

	// #region State

	/**
	 * Main function that validates form changes.
	 * All changes made on the from will be validated here 
	 * 
	 * @param cb Function that is going to change the from
	 * @param produceOptions
	 * @returns Return the new State(form and errors) or a Promise of the new State
	 */
	const produceNewState = (
		cb: OnFunctionChange<T>, 
		produceOptions?: ProduceNewStateOptionsHistory & ResetOptions
	): void | Promise<void> => {
		const oldState = stateRef.current;
		const newState: State<T> = {
			form: oldState.form,
			errors: {
				...oldState.errors 
			},
			touches: {
				...oldState.touches 
			}
		};

		changedKeys.current.clear();

		const proxy = observeChanges(
			newState.form,
			(
				paths,
				value,
				previousValue
			) => {
				// @ts-expect-error // Paths are array, but on-change doesn't see it like that
				const key = getKeyFromPaths<T>(paths);

				if ( 
					key && 
					!(produceOptions?.triggerTouched === false) &&
					typeof getterSetter.get(key, newState.form) !== 'function'
				) {
					options?.onTouch && options?.onTouch(
						key, 
						value,
						previousValue
					)

					// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
					const didTouch = typeof value === 'boolean' ? Boolean(`${previousValue})` !== `${value}`) : previousValue !== value
	
					newState.touches[key] = ((newState.touches[key] ?? false) || didTouch);

					updateController(key as FormKey<T>)
				}
			},
			{
				pathAsArray: true,
				details: true
			}
		)

		const result = cb(proxy);

		const _setFormState = (newState: State<T>) => {
			newState.errors = produceOptions?.filterKeysError 
				? Object.entries(newState.errors)
				.reduce<FormErrors<T>>((errors, [key, value]) => {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					if ( newState.touches[key as FormKey<T>] || produceOptions?.filterKeysError!(key as FormKey<T>) ) {
						errors[key as FormKey<T>] = value as string[]
					}
					return errors;
				}, {}) 
				: newState.errors
			
			setFormState(newState)
		}

		if ( result instanceof Promise ) {
			return result
			.then(() => {
				executeWatch({
					changedKeys,
					hasWatchingKeys,
					onWatch,
					proxy,
					setFormData,
					newState,
					unsubscribe: () => observeChanges.unsubscribe(proxy),
					validateState,
					setFormState: _setFormState,
					options,
					produceOptions
				})
			});
		}

		executeWatch({
			changedKeys,
			hasWatchingKeys,
			onWatch,
			proxy,
			setFormData,
			newState,
			unsubscribe: () => observeChanges.unsubscribe(proxy),
			validateState,
			setFormState: _setFormState,
			options,
			produceOptions
		})
	}

	const reset = async (
		newFrom: Partial<T>, 
		resetOptions?: ResetOptions
	) => {
		const options: ResetOptions = {
			clearTouched: true,
			...(resetOptions ?? {})
		}

		const result = produceNewState(
			(form: T) => {
				(Object.keys(newFrom) as Array<keyof T>)
				.forEach((key: keyof T) => {
					form[key as keyof T] = newFrom[key] as T[keyof T];
				})
			}, 
			options
		);

		if ( result instanceof Promise ) {
			await result;
		}
	}

	const triggerChange = (cb: OnFunctionChange<T>, produceOptions?: ProduceNewStateOptions) => {
		produceNewState(cb, produceOptions);
	}

	const merge = (mergedForm: Partial<T>) => {
		triggerChange((form: T) => {
			Object.keys(mergedForm)
			.forEach((key: unknown) => {
				if ( form[key as keyof T] && mergedForm[key as keyof T] ) {
					form[key as keyof T] = mergedForm[key as keyof T] as T[keyof T];
				}
			})
		})
	}

	const resetTouch = () => {
		setFormState({
			form: stateRef.current.form,
			errors: stateRef.current.errors,
			touches: {}
		})
	}
	// #endregion State

	// #region Form elements
	const onChange = (
		key: FormKey<T>, 
		fieldOptions?: FieldOptions<T[FormKey<T>]>
	) => (value: T[FormKey<T>] | ChangeEvent) => {
		let _value: T[FormKey<T>] = value as T[FormKey<T>];

		const target = value && (value as ChangeEvent<HTMLInputElement>).currentTarget;

		if ( target && target.tagName && (target.tagName.toLocaleUpperCase() === 'INPUT' || target.tagName.toLocaleUpperCase() === 'TEXTAREA') ) {
			_value = target.value as T[FormKey<T>];
		}

		if ( fieldOptions && fieldOptions.onChange ) {
			_value = fieldOptions.onChange(_value);
		}

		triggerChange(
			(form: T) => {
				getterSetter.set(key, form, _value);
			}, 
			fieldOptions
		)
	}

	const getValue = (key: FormKey<T>): any => {
		return getterSetter.get(key, stateRef.current.form);
	}

	const field = (
		key: FormKey<T>, 
		fieldOptions?: FieldOptions<T>
	): FieldForm => {
		const value = getValue(key);

		if ( fieldOptions?.blur ) {
			return {
				name: key,
				onBlur: onChange(key, fieldOptions),
				defaultValue: value
			}
		}

		if ( fieldOptions?.readOnly ) {
			return {
				name: key,
				readOnly: true,
				value
			}
		}

		return {
			name: key,
			onChange: onChange(key, fieldOptions),
			value
		}
	};

	const changeValue = (
		key: FormKey<T>, 
		value: T[FormKey<T>], 
		produceOptions?: FieldOptions<any>
	) => {
		onChange(key, produceOptions)(value);
	}
	// #endregion Form elements

	// #region Errors
	const setError = (
		newErrors: Array<{
			errors: string[]
			path: FormKey<T>
		}>
	) => {
		const {
			errors, form, touches 
		} = stateRef.current
		const _errors = formatErrors(newErrors, errors)

		setFormState({
			form,
			errors: _errors,
			touches
		})
	}

	// #endregion Errors
	const getFormRef = useRef<UseFormReturn<T>>()

	const result: any = {
		form,
		get context() {
			return getFormRef.current as FormContextObject<T>;
		},
		errors,
		get isValid(): boolean {
			return Object.keys(errors).length === 0;
		},
		touches,
		get isTouched( ) {
			return Object.keys(touches).length !== 0;
		},

		changedKeys,

		// #region Form actions

		field,
		triggerChange,
		handleSubmit,

		setError,
		hasError,
		getErrors,

		reset,
		merge,
		onChange,
		changeValue,
		getValue,

		resetTouch,
		watch,
		updateController,
		_setFormState
		// #endregion Form actions
	}

	getFormRef.current = result;

	return result;
}
