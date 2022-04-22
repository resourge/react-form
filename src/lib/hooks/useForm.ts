/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { FormEvent, useRef, MouseEvent, useEffect } from 'react';

import observeChanges from 'on-change';

import { FormKey } from '../types/FormKey';
import { 
	FormErrors, OnFunctionChange, ValidateSubmission, 
	SubmitHandler, FieldForm, FormState, ProduceNewStateOptions, 
	FieldOptions, ResetOptions, FormOptions
} from '../types/types'
import { shallowClone } from '../utils/shallowClone';
import { getKeyFromPaths } from '../utils/utils';
import { getDefaultOnError } from '../validators/setDefaultOnError';

import { useCacheErrors } from './useCacheErrors';
import { useCancelableState } from './useCancelableState';
import { useGetterSetter } from './useGetterSetter';
import { Touches, useTouches } from './useTouches';

type State<T extends object> = {
	form: T
	errors?: FormErrors<T>
}

export const useForm = <T extends Record<string, any>>(
	_defaultValue: T, 
	options?: FormOptions<T>
): FormState<T> => {
	const onErrors = options?.onErrors ?? getDefaultOnError();

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

	const [state, setFormState] = useCancelableState<State<T>>(() => ({
		errors: undefined,
		form: shallowClone(defaultValue)
	}));

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
				const newErrors = onErrors(errors);

				_setFormState({
					form,
					errors: newErrors
				})

				if ( onInvalidRef.current ) {
					const canGoOn = await Promise.resolve(onInvalidRef.current(newErrors, errors));

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
			errors: undefined
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
		let newErrors;
		try {
			options?.validate && await (Promise.resolve(options?.validate(state.form)));
			newErrors = {}
		}
		catch ( errors ) {
			newErrors = onErrors(errors);
		}
		finally {
			// eslint-disable-next-line no-unsafe-finally
			return { 
				form: state.form,
				errors: newErrors ?? {}
			}
		}
	}

	/**
	 * After each render clear current touches to not pollute the next render
	 */
	useEffect(() => {
		clearCurrentTouches();
	})

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

		if ( 
			Boolean(produceOptions?.forceValidation) || 
			(
				produceOptions?.validate && 
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
			triggerTouched: false,
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
			_newState.errors = undefined;
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
			key: FormKey<T>
			message: string
		}>
	) => {
		const _errors: FormErrors<T> = {
			...(errors ?? {})
		}

		newErrors.forEach(({ key, message }) => {
			(!_errors[key] ? (_errors[key] = []) : _errors[key])?.push(message)
		})

		setFormState({
			form,
			errors: _errors
		})
	}

	const getFormErrors = <Model extends object>(_key: FormKey<T>) => {
		const key: string = _key as string;
		const deepKey: string = `get_deep_errors_${key}`;

		return setCacheErrors(
			deepKey, 
			() => {
				return Object.keys(errors ?? {})
				.reduce((err: FormErrors<Model>, errorKey: string) => {
					if ( errorKey.includes(key) ) {
						const keys: [string, FormKey<Model>] = errorKey.split(key) as [string, FormKey<Model>];
						if ( keys.length > 1 ) {
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							const [_, newKey] = keys;
		
							const elementKey: FormKey<Model> = newKey
							.replace(/^\..*?/igm, '')
							.replace(/^\[\d\]\..*?/igm, '') as FormKey<Model>
		
							err[elementKey] = (errors ?? {})[errorKey as keyof typeof errors];
						}
					}
					return err;
				}, {});
			}
		)
	}

	const getErrors = (
		key: FormKey<T>, 
		onlyOnTouch: boolean = false
	): string[] => {
		const _key: string = `get_errors_${key}`;

		return setCacheErrors(
			_key, 
			() => {
				if ( !onlyOnTouch || (onlyOnTouch && touches.current[key as keyof Touches<T>]) ) {
					return errors && errors[key] ? errors[key] ?? [] : [];
				}
				return [];
			}
		)
	}
	// #endregion Errors

	const getFormRef = useRef<FormState<T>>()

	const formState: FormState<T> = [
		{
			form,
			errors,
			get isValid(): boolean {
				const nativeIsValid = !errors || Object.keys(errors).length === 0;

				return (
					options?.isValid && options?.isValid({
						form, 
						errors,
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
		{
			field,
			triggerChange,
			handleSubmit,

			setError,
			getErrors,
			getFormErrors,

			reset,
			merge,
			changeValue,
			getValue,
			onChange,

			resetTouch,
			triggerManualTouch
		}
	] as unknown as FormState<T>

	getFormRef.current = formState;

	return formState
}
