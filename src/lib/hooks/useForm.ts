/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { FormEvent, useRef, MouseEvent, useEffect } from 'react';

import observeChanges from 'on-change';
import invariant from 'tiny-invariant'

import { FormKey } from '../types/FormKey';
import { 
	FormErrors, OnFunctionChange, ValidateSubmission, 
	SubmitHandler, FieldForm, FormState, ProduceNewStateOptions, 
	FieldOptions, ResetOptions, FormOptions, 
	GetErrorsOptions, GetErrorsWithChildren, FormSimpleErrors, 
	HasErrorOptions
} from '../types/types'
import { createFormErrors, formatErrors, getFormErrorsDefault } from '../utils/createFormErrors';
import { shallowClone } from '../utils/shallowClone';
import { getKeyFromPaths } from '../utils/utils';
import { getDefaultOnError } from '../validators/setDefaultOnError';

import { useCacheErrors } from './useCacheErrors';
import { useCancelableState } from './useCancelableState';
import { useGetterSetter } from './useGetterSetter';
import { Touches, useTouches } from './useTouches';

type State<T extends Record<string, any>> = {
	form: T
} & FormErrors<T>

const checkIfCanCheckError = (
	key: string,
	touches: React.MutableRefObject<Touches<any>>,
	onlyOnTouch?: boolean
) => {
	return !onlyOnTouch || (onlyOnTouch && touches.current[key])
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
		let errors: FormErrors<T> = getFormErrorsDefault();

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
			...errors,
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
		errors,
		simpleErrors
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
				if (!onErrors) {
					throw new Error('Missing declaration setDefaultOnError handler on the initialization of your application.')
				}
				
				const newErrors = onErrors(errors);

				_setFormState({
					form,
					...newErrors
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
			simpleErrors: {},
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
				errors: {},
				simpleErrors: {}
			}
		}
		catch ( errors ) {
			const newErrors = onErrors(errors);
			return { 
				form: state.form,
				...newErrors
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
			errors: { ...oldState.errors },
			simpleErrors: { ...oldState.simpleErrors }
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
			errors: newState.errors,
			simpleErrors: newState.simpleErrors
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
			_newState.errors = {};
			_newState.simpleErrors = {};
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
		const _newErrors = formatErrors(newErrors, { errors, simpleErrors })
		setFormState({
			form,
			..._newErrors
		})
	}

	const hasError = (
		key: FormKey<T>, 
		options: HasErrorOptions = {
			strict: true,
			onlyOnTouch: false
		}
	): boolean => {
		const {
			strict = true,
			onlyOnTouch = false
		} = options;
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		const _key: string = `get_errors_${key}_${strict}_${onlyOnTouch}`;

		return setCacheErrors<boolean>(
			_key, 
			() => {
				const _errors: FormSimpleErrors<T> = simpleErrors ?? {};

				let hasError = false;
				if ( checkIfCanCheckError(key, touches, onlyOnTouch) ) {
					hasError = Boolean(_errors[key]);
				}

				if ( hasError ) {
					return true;
				}
				else {
					if ( !strict ) {
						const regex = new RegExp(`^${key.replace('[', '\\[').replace(']', '\\]')}`, 'g')
	
						return Object.keys(_errors)
						.some((errorKey) => {
							if ( checkIfCanCheckError(errorKey, touches, onlyOnTouch) ) {
								return regex.test(errorKey)
							}
							return false;
						})
					}
				}

				return hasError;
			}
		)
	}

	function getErrors<Model extends Record<string, any> = T>(
		key: FormKey<Model>, 
		options: GetErrorsOptions = {
			strict: true,
			onlyOnTouch: false,
			includeKeyInChildErrors: true,
			includeChildsIntoArray: false
		}
	): GetErrorsWithChildren<Model> {
		const {
			strict = true,
			onlyOnTouch = false,
			includeKeyInChildErrors = true,
			includeChildsIntoArray = false
		} = options;

		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		const _key: string = `get_errors_${key}_${strict}_${onlyOnTouch}_${includeKeyInChildErrors}_${includeChildsIntoArray}`;

		return setCacheErrors<GetErrorsWithChildren<Model>>(
			_key, 
			() => {
				const _errors: FormSimpleErrors<T> = simpleErrors ?? {};
				const getErrors = (key: FormKey<Model>): GetErrorsWithChildren<Model> => {
					if ( checkIfCanCheckError(key, touches, onlyOnTouch) ) {
						// @ts-expect-error // Working with array and object
						return [..._errors[key] ?? []];
					}
					// @ts-expect-error // Working with array and object
					return []
				}

				const newErrors = getErrors(key);

				if ( !strict ) {
					const regex = new RegExp(`^${key.replace('[', '\\[').replace(']', '\\]')}`, 'g')

					Object.keys(_errors)
					.forEach((errorKey: string) => {
						if ( errorKey.includes(key) && errorKey !== key ) {
							let newErrorKey = includeKeyInChildErrors === true ? errorKey : (
								errorKey.replace(regex, '') || key
							)

							// Remove first char if is a "."
							if ( newErrorKey[0] === '.' ) {
								newErrorKey = newErrorKey.substring(1, newErrorKey.length)
							}

							if ( includeChildsIntoArray ) {
								newErrors.push(errorKey as FormKey<T>);
							}
							
							newErrors[newErrorKey as keyof GetErrorsWithChildren<Model>] = getErrors(errorKey as FormKey<Model>) as any;
						}
					});
				}

				return newErrors;
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
						simpleErrors,
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
	] as unknown as FormState<T>

	getFormRef.current = formState;

	return formState
}
