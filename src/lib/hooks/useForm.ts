/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { FormEvent, useRef, MouseEvent, useEffect } from 'react';

import observeChanges from 'on-change';
import invariant from 'tiny-invariant'

import { FormKey } from '../types/FormKey';
import { 
	OnFunctionChange, ValidateSubmission, 
	SubmitHandler, FieldForm, FormState, ProduceNewStateOptions, 
	FieldOptions, ResetOptions, FormOptions, FormErrors
} from '../types/types'
import { createFormErrors, formatErrors } from '../utils/createFormErrors';
import { shallowClone } from '../utils/shallowClone';
import { getKeyFromPaths } from '../utils/utils';
import { getDefaultOnError } from '../validators/setDefaultOnError';

import { useCacheErrors } from './useCacheErrors';
import { useCancelableState } from './useCancelableState';
import { useErrors } from './useErrors';
import { useGetterSetter } from './useGetterSetter';
import { useTouches } from './useTouches';

type State<T extends Record<string, any>> = {
	form: T
	errors: FormErrors<T>
}

export const useForm = <T extends Record<string, any>>(
	_defaultValue: T, 
	options?: FormOptions<T>
): FormState<T> => {
	const _onErrors = options?.onErrors ?? getDefaultOnError();

	invariant(_onErrors, 'Missing declaration `setDefaultOnError` handler on the initialization of your application.')

	const onErrors = createFormErrors<T>(_onErrors)

	const defaultValue = useRef(_defaultValue).current;

	const onValidRef = useRef<SubmitHandler<T, unknown>>();
	const onInvalidRef = useRef<ValidateSubmission<T>>();

	const [
		{
			isTouched,
			touches
		},
		{
			resetTouch,
			setTouch,
			triggerManualTouch,
			clearCurrentTouches
		}
	] = useTouches<T>();

	const getterSetter = useGetterSetter<T>();

	const wasInitialValidationPromise = useRef(false);
	
	const [state, setFormState] = useCancelableState<State<T>>(() => {
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
			form
		}
	});

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
		errors
	} = state

	const {
		setCacheErrors,
		clearCacheErrors
	} = useCacheErrors({}, [errors]);

	const _setFormState = (state: State<T> | ((prevState: State<T>) => void | State<T> | null | undefined)) => {
		clearCacheErrors();
		setFormState(state);
	}

	// #region Submit
	/**
	 * Handles the form submit
	 */
	async function onSubmit<K = void>(e?: FormEvent<HTMLFormElement> | MouseEvent<any, MouseEvent>): Promise<K | undefined> {
		if ( e ) {
			e.preventDefault();
			e.persist();
		}
		try {
			options?.validate && await (Promise.resolve(options?.validate(state.form)));
		}
		catch ( errors ) {
			if ( errors ) {
				const _errors = onErrors(errors);

				_setFormState({
					form,
					errors: _errors
				})

				if ( onInvalidRef.current ) {
					const canGoOn = await Promise.resolve(onInvalidRef.current(_errors, errors));

					if ( !canGoOn ) {
						return await Promise.reject(errors)
					}
				}
				else {
					return await Promise.reject(errors)
				}
			}
		}

		resetTouch();

		_setFormState({
			form,
			errors: {}
		})
		
		// @ts-expect-error
		return onValidRef.current && onValidRef.current(state.form);
	}

	function handleSubmit<K = void>(
		onValid: SubmitHandler<T, K>,
		onInvalid?: ValidateSubmission<T>
	) {
		onValidRef.current = onValid;
		onInvalidRef.current = onInvalid;
		return (e?: FormEvent<HTMLFormElement> | MouseEvent<any, MouseEvent>) => onSubmit<K>(e)
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
				errors: {}
			}
		}
		catch ( err ) {
			const errors = onErrors(err);
			return { 
				form: state.form,
				errors
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
			errors: { ...oldState.errors }
		};

		let isOnUpdateTouched = isTouched.current;

		clearCurrentTouches();

		const proxy = observeChanges(
			newState.form,
			(
				paths,
				value,
				previousValue
			) => {
				// @ts-expect-error
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
					setTouch(key, didTouch);

					isOnUpdateTouched = isOnUpdateTouched || didTouch;
				}
	
				// getterSetter.set(key, newState.form, value);
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
			errors: newState.errors
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
			resetTouch();
		}
			
		_setFormState(_newState);
	}

	const triggerChange = (cb: OnFunctionChange<T>, produceOptions?: ProduceNewStateOptions) => {
		_setFormState((state) => {
			const result = produceNewState(state, cb, produceOptions);

			if ( result instanceof Promise ) {
				result
				.then((newState) => {
					_setFormState(newState)
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
		onChange(key as any, produceOptions)(value);
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
			errors: _errors
		})
	}

	const {
		hasError,
		getErrors,
		proxyError
	} = useErrors(
		errors,
		touches,
		setCacheErrors
	)

	// #endregion Errors

	const getFormRef = useRef<FormState<T>>()

	const formActions = {
		field,
		triggerChange,
		handleSubmit,

		setError,
		hasError,
		getErrors,

		reset,
		merge,
		changeValue,
		getValue,
		onChange,

		resetTouch,
		triggerManualTouch
	}

	const formState: FormState<T> = [
		{
			form,
			errors: proxyError,
			get isValid(): boolean {
				const nativeIsValid = !errors || Object.keys(errors).length === 0;

				return (
					options?.isValid && options?.isValid({
						form, 
						errors: proxyError,
						isValid: nativeIsValid
					})
				) ?? nativeIsValid
			},
			isTouched: isTouched.current,
			touches: touches.current,
			get context() {
				return getFormRef.current as FormState<T>;
			}
		}, 
		formActions
	] as unknown as FormState<T>

	Object.assign(formState, formActions)

	getFormRef.current = formState;

	return formState
}
