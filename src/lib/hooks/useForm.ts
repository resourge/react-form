/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { FormEvent, useRef, MouseEvent, useEffect } from 'react';

import observeChanges from 'on-change';
import invariant from 'tiny-invariant'

import { FormContextObject } from '../contexts/FormContext';
import { FormKey } from '../types/FormKey';
import { 
	OnFunctionChange, ValidateSubmission, 
	SubmitHandler, FieldForm, ProduceNewStateOptions, 
	FieldOptions, ResetOptions, FormOptions, FormErrors, 
	UseFormReturn, Touches
} from '../types/types'
import { createFormErrors, formatErrors } from '../utils/createFormErrors';
import { shallowClone } from '../utils/shallowClone';
import { getKeyFromPaths } from '../utils/utils';
import { getDefaultOnError } from '../validators/setDefaultOnError';

import { useCacheErrors } from './useCacheErrors';
import { useCancelableState } from './useCancelableState';
import { useErrors } from './useErrors';
import { useGetterSetter } from './useGetterSetter';
import { useProxy } from './useProxy';

type State<T extends Record<string, any>> = {
	form: T
	errors: FormErrors<T>
	touches: Touches<T>
}

export const useForm = <T extends Record<string, any>>(
	_defaultValue: T, 
	options?: FormOptions<T>
): UseFormReturn<T> => {
	const _onErrors = options?.onErrors ?? getDefaultOnError();

	invariant(_onErrors, 'Missing declaration `setDefaultOnError` handler on the initialization of your application.')

	const onErrors = createFormErrors<T>(_onErrors)

	const defaultValue = useRef(_defaultValue).current;

	const getterSetter = useGetterSetter<T>();
	const {
		setCacheErrors,
		clearCacheErrors
	} = useCacheErrors();

	const wasInitialValidationPromise = useRef(false);

	const [state, setFormState] = useCancelableState<State<T>>(
		() => {
			const form = shallowClone(defaultValue)
			let errors: FormErrors<T> = {};

			if ( options?.validateDefault ) {
				try {
					const valid = options?.validate && options?.validate(form);
					wasInitialValidationPromise.current = valid instanceof Promise;
				}
				catch ( err ) {
					errors = onErrors(err);
				}
			}

			return {
				errors,
				form,
				touches: {}
			}
		},
		(oldState, newState) => {
			clearCacheErrors();

			Object.keys(newState.errors)
			.filter((key) => !Object.keys(oldState.errors).includes(key))
			.forEach((key) => {
				addChangedKey(key as FormKey<T>)
			})
		}
	);

	const changedKeys = useRef<Set<FormKey<T>>>(new Set());
	const addChangedKey = (key: FormKey<T>) => {
		changedKeys.current.add(key)
	}

	useEffect(() => {
		changedKeys.current = new Set();
	}, [state.touches]);

	/**
	 * In case validate `useCancelableState` is not able to validate the errors
	 * (ex: validate is a promise), this useEffect will
	 */
	useEffect(() => {
		if ( options?.validateDefault && wasInitialValidationPromise.current === true ) {
			validateState(state)
			.then((state) => {
				setFormState(state)
			})
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const {
		form,
		errors,
		touches
	} = state

	const formState = useProxy(
		errors,
		touches
	)

	// #region Submit
	/**
	 * Handles the form submit
	 */
	async function onSubmit<K = void>(
		onValid: SubmitHandler<T, K>,
		onInvalid?: ValidateSubmission<T>,
		e?: FormEvent<HTMLFormElement> | MouseEvent<any, MouseEvent>
	): Promise<K | undefined> {
		if ( e ) {
			e.preventDefault();
			e.persist();
		}
		try {
			options?.validate && await (Promise.resolve(options?.validate(form)));
		}
		catch ( errors ) {
			if ( errors ) {
				const _errors = onErrors(errors);

				Object.keys(_errors)
				.forEach((key) => {
					touches[key as keyof Touches<T>] = true;
				})

				setFormState({
					form,
					errors: _errors,
					touches
				})

				if ( onInvalid ) {
					const canGoOn = await Promise.resolve(onInvalid(_errors, errors));

					if ( !canGoOn ) {
						return await Promise.reject(errors)
					}
				}
				else {
					return await Promise.reject(errors)
				}
			}
		}

		setFormState({
			form,
			errors: {},
			touches: {}
		})
		
		return await onValid(state.form);
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
	 * Validates the form
	 * @param state Current State
	 * @returns New validated state
	 */
	const validateState = async (state: State<T>): Promise<State<T>> => {
		try {
			options?.validate && await (Promise.resolve(options?.validate(state.form)));
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

	/**
	 * Main function that validates form changes.
	 * All changes made on the from will be validated here 
	 * 
	 * @param oldState Current state that is going to be validated
	 * @param cb Function that is going to change the from
	 * @param produceOptions
	 * @returns Return the new State(form and errors) or a Promise of the new State
	 */
	const produceNewState = (
		oldState: State<T>, 
		cb: OnFunctionChange<T>, 
		produceOptions?: ProduceNewStateOptions
	): State<T> | Promise<State<T>> => {
		const newState: State<T> = {
			form: oldState.form,
			errors: { ...oldState.errors },
			touches: { ...oldState.touches }
		};

		let isOnUpdateTouched = false;

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

					isOnUpdateTouched = isOnUpdateTouched || didTouch;

					addChangedKey(key as FormKey<T>)
				}
			},
			{
				pathAsArray: true,
				details: true
			}
		)

		cb(proxy);

		newState.form = observeChanges.unsubscribe(proxy);

		const validate = produceOptions?.validate ?? options?.validateDefault;

		if ( 
			Boolean(produceOptions?.forceValidation) || 
			(
				validate && 
				isOnUpdateTouched
			)
		) {
			return validateState(newState);
		}

		return { 
			form: newState.form,
			errors: newState.errors,
			touches: newState.touches
		}
	}

	const reset = async (
		newFrom: Partial<T> = defaultValue, 
		resetOptions?: ResetOptions
	) => {
		const options: ResetOptions = {
			clearTouched: true,
			...(resetOptions ?? {})
		}

		const newState = produceNewState(
			state, 
			(form: T) => {
				(Object.keys(newFrom) as Array<keyof T>)
				.forEach((key: keyof T) => {
					// @ts-expect-error
					form[key] = newFrom[key];
				})
			}, 
			options
		) as State<T>

		let _newState = newState;
		if ( newState instanceof Promise ) {
			_newState = await newState;
		}

		if ( !options.forceValidation ) {
			_newState.errors = {};
		}

		if ( options.clearTouched ) {
			_newState.touches = {};
		}
			
		setFormState(_newState);
	}

	const triggerChange = (cb: OnFunctionChange<T>, produceOptions?: ProduceNewStateOptions) => {
		setFormState((state) => {
			const result = produceNewState(state, cb, produceOptions);

			if ( result instanceof Promise ) {
				result
				.then((newState) => {
					setFormState(newState)
				})
				return;
			}

			return result
		})
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
			form,
			errors,
			touches: {}
		})
	}

	const setTouch = (key: FormKey<T>, touched: boolean = true) => {
		setFormState({
			form,
			errors,
			touches: {
				...touches,
				[key]: touched
			}
		})
	}
	// #endregion State

	// #region Form elements
	const onChange = (
		key: FormKey<T>, 
		fieldOptions?: FieldOptions<T[FormKey<T>]>
	) => (value: T[FormKey<T>]) => {
		let _value: T[FormKey<T>] = value;
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
		return getterSetter.get(key, form);
	}

	const field = (
		key: FormKey<T>, 
		options?: FieldOptions
	): FieldForm => {
		if ( !options?.readOnly ) {
			return {
				name: key,
				onChange: onChange(key, options),
				value: getValue(key)
			}
		}

		return {
			name: key,
			readOnly: true,
			value: getValue(key)
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
			path: FormKey<T>
			errors: string[]
		}>
	) => {
		const _errors = formatErrors(newErrors, errors)

		setFormState({
			form,
			errors: _errors,
			touches
		})
	}

	const {
		hasError,
		getErrors
	} = useErrors(
		errors,
		touches,
		setCacheErrors
	)

	// #endregion Errors
	const getFormRef = useRef<UseFormReturn<T>>()

	const result: any = {
		form,
		get context() {
			return getFormRef.current as FormContextObject<T>;
		},
		errors,
		get isValid(): boolean {
			const nativeIsValid = formState.isValid;

			return (
				options?.isValid && options?.isValid({
					form, 
					errors,
					touches,
					formState,
					isValid: nativeIsValid
				})
			) ?? nativeIsValid
		},
		touches,
		get isTouched( ) {
			return formState.isTouched
		},
		formState,

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
		setTouch
		// #endregion Form actions
	}

	getFormRef.current = result;

	return result;
}
