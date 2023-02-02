/* eslint-disable @typescript-eslint/prefer-function-type */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import {
	FormEvent,
	useRef,
	MouseEvent,
	ChangeEvent,
	useState
} from 'react'

import { shallowClone } from '@resourge/shallow-clone';
import observeChanges from 'on-change';

import { FormContextObject } from '../contexts/FormContext';
import { FormKey } from '../types/FormKey';
import {
	OnFunctionChange,
	ValidateSubmission,
	SubmitHandler,
	FieldForm,
	ProduceNewStateOptions,
	FieldOptions,
	ResetOptions,
	FormOptions,
	UseFormReturn,
	Touches,
	ProduceNewStateOptionsHistory,
	State
} from '../types/types'
import { createFormErrors, formatErrors } from '../utils/createFormErrors';
import { getKeyFromPaths, isClass } from '../utils/utils'
import { getDefaultOnError } from '../validators/setDefaultOnError';

import { useChangedKeys } from './useChangedKeys';
import { useErrors } from './useErrors';
import { useFixCursorJumpingToEnd } from './useFixCursorJumpingToEnd';
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
	useFixCursorJumpingToEnd();

	const onErrors = createFormErrors<T>(options?.onErrors ?? getDefaultOnError());
	// #endregion errors

	// #region State
	const [state, _setFormState] = useState<State<T>>(() => ({
		errors: {},
		// eslint-disable-next-line new-cap
		form: typeof defaultValue === 'function' 
			? (
				isClass(defaultValue) 
					? new (defaultValue as new () => T)() 
					: (defaultValue as () => T)()
			) : shallowClone(defaultValue),
		touches: {}
	}));
	const stateRef = useRef<State<T>>(state);
	stateRef.current = state;

	const setFormState = (newState: State<T>) => {
		clearCacheErrors();

		Object.keys(newState.errors)
		.filter((key) => !Object.keys(stateRef.current.errors)
		.includes(key))
		.forEach((key) => {
			updateController(key as FormKey<T>)
		})

		_setFormState(newState)
	}
	// #endregion State

	const getterSetter = useGetterSetter<T>();

	const {
		watch,
		onWatch,
		onSubmitWatch
	} = useWatch();

	const {
		hasError,
		getErrors,
		clearCacheErrors
	} = useErrors(
		state.errors,
		state.touches
	)

	const [changedKeys, updateController] = useChangedKeys(state.touches)

	/**
	 * Validates the form
	 * @param state Current State
	 * @returns New validated state
	 */
	const validateState = async (state: State<T>): Promise<State<T>> => {
		try {
			const errors = options?.validate && await (Promise.resolve(options?.validate(state.form, [...changedKeys.current] as Array<FormKey<T>>)));
			if ( errors && errors.length ) {
				// eslint-disable-next-line @typescript-eslint/no-throw-literal
				throw errors;
			}
			if ( options?.onSubmit ) {
				options?.onSubmit(state);
			}
			return { 
				form: state.form,
				errors: {},
				touches: state.touches
			}
		}
		catch ( err ) {
			const errors = onErrors(err);
			return { 
				form: state.form,
				errors,
				touches: state.touches
			}
		}
	}

	// #region Submit
	/**
	 * Handles the form submit
	 */
	async function onSubmit<K = void>(
		onValid: SubmitHandler<T, K>,
		onInvalid?: ValidateSubmission<T>,
		e?: FormEvent<HTMLFormElement> | MouseEvent<any, MouseEvent>
	): Promise<K | undefined> {
		const { form, touches } = stateRef.current
		if ( e ) {
			e.preventDefault();
			e.persist();
		}

		const proms = onSubmitWatch.current();

		const { errors } = await validateState(stateRef.current);

		const hasError = Object.keys(errors).length

		let _touches: Touches<T> = {}
		if ( hasError ) {
			_touches = {
				...touches 
			}

			Object.keys(errors)
			.forEach((key) => {
				_touches[key as keyof Touches<T>] = true;
			})
		}

		setFormState({
			form,
			errors,
			touches: _touches
		})

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
		
		const result = await onValid(state.form);

		await proms(state.form);

		return result;
	}

	function handleSubmit<K = void>(
		onValid: SubmitHandler<T, K>,
		onInvalid?: ValidateSubmission<T>
	) {
		return (e?: FormEvent<HTMLFormElement> | MouseEvent<any, MouseEvent>) => 
			onSubmit<K>(
				onValid,
				onInvalid,
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
	const produceNewState = async (
		cb: OnFunctionChange<T>, 
		produceOptions?: ProduceNewStateOptionsHistory
	): Promise<State<T>> => {
		const oldState = stateRef.current;
		let newState: State<T> = {
			form: oldState.form,
			errors: {
				...oldState.errors 
			},
			touches: {
				...oldState.touches 
			}
		};

		changedKeys.current.clear();

		const changes: any[] = [];

		const proxy = observeChanges(
			newState.form,
			(
				paths,
				value,
				previousValue
			) => {
				// @ts-expect-error // Paths are array, but on-change doesn't see it like that
				const key = getKeyFromPaths<T>(paths);

				changes.push((form: any) => {
					getterSetter.set(key, form, previousValue)
				})

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

		if ( result instanceof Promise ) {
			await result;
		}

		if (!produceOptions?.type) {
			await onWatch.current(proxy, changedKeys)
		}

		newState.form = observeChanges.unsubscribe(proxy);

		const validate = produceOptions?.validate ?? (options?.validateDefault ?? true);

		if ( 
			Boolean(produceOptions?.forceValidation) || validate
		) {
			newState = await validateState(newState);
		}

		if ( options?.onChange ) {
			await options.onChange(newState)
		}

		return newState
	}

	const reset = async (
		newFrom: Partial<T>, 
		resetOptions?: ResetOptions
	) => {
		const options: ResetOptions = {
			clearTouched: true,
			...(resetOptions ?? {})
		}

		const newState = await produceNewState(
			(form: T) => {
				(Object.keys(newFrom) as Array<keyof T>)
				.forEach((key: keyof T) => {
					form[key as keyof T] = newFrom[key] as T[keyof T];
				})
			}, 
			options
		)

		if ( options.clearTouched ) {
			newState.touches = {};
		}

		setFormState(newState);
	}

	const triggerChange = async (cb: OnFunctionChange<T>, produceOptions?: ProduceNewStateOptions) => {
		const result = await produceNewState(cb, produceOptions);
		
		setFormState(result)
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
		form: state.form,
		get context() {
			return getFormRef.current as FormContextObject<T>;
		},
		errors: state.errors,
		get isValid(): boolean {
			return Object.keys(state.errors).length === 0;
		},
		touches: state.touches,
		get isTouched( ) {
			return Object.keys(state.touches).length !== 0;
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
