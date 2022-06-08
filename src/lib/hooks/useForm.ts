/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { FormEvent, useRef, MouseEvent, useEffect, ChangeEvent, useState } from 'react';

import { shallowClone } from '@resourge/shallow-clone';
import observeChanges from 'on-change';
import invariant from 'tiny-invariant'

import { FormContextObject } from '../contexts/FormContext';
import { FormKey } from '../types/FormKey';
import { 
	OnFunctionChange, ValidateSubmission, 
	SubmitHandler, FieldForm, ProduceNewStateOptions,
	FieldOptions, ResetOptions, FormOptions, FormErrors, 
	UseFormReturn, Touches, ProduceNewStateOptionsHistory
} from '../types/types'
import { createFormErrors, formatErrors } from '../utils/createFormErrors';
import { getKeyFromPaths } from '../utils/utils';
import { getDefaultOnError, ValidationErrors } from '../validators/setDefaultOnError';

import { useChangedKeys } from './useChangedKeys';
import { useErrors } from './useErrors';
import { useFixCursorJumpingToEnd } from './useFixCursorJumpingToEnd';
import { useGetterSetter } from './useGetterSetter';
import { useProxy } from './useProxy';
import { useUndoRedo } from './useUndoRedo';
import { useWatch } from './useWatch';

type State<T extends Record<string, any>> = {
	form: T
	errors: FormErrors<T>
	touches: Touches<T>
}

export const useForm = <T extends Record<string, any>>(
	_defaultValue: T, 
	options?: FormOptions<T>
): UseFormReturn<T> => {
	// #region errors
	const _onErrors = options?.onErrors ?? getDefaultOnError();

	invariant(_onErrors, 'Missing declaration `setDefaultOnError` handler on the initialization of your application.')
	useFixCursorJumpingToEnd();
	const onErrors = createFormErrors<T>(_onErrors)
	// #endregion errors

	// #region State
	const defaultValue = useRef(_defaultValue).current;

	const initialValidationPromise = useRef<Promise<void> | Promise<ValidationErrors> | undefined>(undefined);

	const [state, _setFormState] = useState<State<T>>(() => {
		const form = shallowClone(defaultValue)
		let errors: FormErrors<T> = {};

		if ( options?.validateDefault ) {
			try {
				const errors = options?.validate && options?.validate(form, []);
				if ( errors instanceof Promise ) {
					initialValidationPromise.current = errors;
				}
				else if ( errors && errors.length ) {
					// eslint-disable-next-line @typescript-eslint/no-throw-literal
					throw errors;
				}
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
	});
	const stateRef = useRef<State<T>>(state);
	stateRef.current = state;

	const setFormState = (newState: State<T>) => {
		clearCacheErrors();

		Object.keys(newState.errors)
		.filter((key) => !Object.keys(stateRef.current.errors).includes(key))
		.forEach((key) => {
			updateController(key as FormKey<T>)
		})

		_setFormState(newState)
	}

	/**
	 * In case validate `useState` is not able to validate the errors
	 * (ex: validate is a promise), this useEffect will
	 */
	useEffect(() => {
		if ( initialValidationPromise.current ) {
			initialValidationPromise.current
			.then((err) => {
				const errors = onErrors(err);
				setFormState({
					errors,
					form: state.form,
					touches: {}
				})
			})
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	// #endregion State

	const getterSetter = useGetterSetter<T>();

	const {
		addAction,
		addTouches,
		undo,
		redo
	} = useUndoRedo<T>(
		(
			{
				changes,
				touches,
				produceOptions
			}, type
		) => {
			const originalTouches = { ...stateRef.current.touches }
			if ( touches ) {
				stateRef.current.touches = touches;
			}
			produceNewState((form) => {
				changes.forEach((cb) => {
					cb(form);
				})
			}, {
				...produceOptions,
				type
			})
			.then((result) => {
				setFormState({
					...result,
					touches: touches ?? {}
				})

				addTouches(originalTouches)
			});
		},
		{
			maxHistory: options?.maxHistory
		}
	)

	const {
		watch,
		onWatch
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

	const formState = useProxy(
		state.errors,
		state.touches
	)

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

		const {
			errors
		} = await validateState(stateRef.current);

		const hasError = Object.keys(errors).length

		setFormState({
			form,
			errors: errors,
			touches: hasError ? touches : {}
		})

		if ( hasError ) {
			Object.keys(errors)
			.forEach((key) => {
				touches[key as keyof Touches<T>] = true;
			})

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
		const newState: State<T> = {
			form: oldState.form,
			errors: { ...oldState.errors },
			touches: { ...oldState.touches }
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

		cb(proxy);

		addAction(
			{
				changes,
				produceOptions,
				touches: { ...oldState.touches }
			}, 
			produceOptions?.type
		);

		if (!produceOptions?.type) {
			await onWatch.current(proxy, changedKeys)
		}

		newState.form = observeChanges.unsubscribe(proxy);

		const validate = produceOptions?.validate ?? options?.validateDefault;

		if ( 
			Boolean(produceOptions?.forceValidation) || validate
		) {
			return await validateState(newState);
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

		const newState = await produceNewState(
			(form: T) => {
				(Object.keys(newFrom) as Array<keyof T>)
				.forEach((key: keyof T) => {
					// @ts-expect-error
					form[key] = newFrom[key];
				})
			}, 
			options
		)

		if ( !options.forceValidation ) {
			newState.errors = {};
		}

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

		const target = (value as ChangeEvent<HTMLInputElement>).currentTarget;

		if ( target && (target.tagName.toLocaleUpperCase() === 'INPUT' || target.tagName.toLocaleUpperCase() === 'TEXTAREA') ) {
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
		fieldOptions?: FieldOptions
	): FieldForm => {
		const value = getValue(key);

		if ( !fieldOptions?.readOnly ) {
			return {
				name: key,
				onChange: onChange(key, fieldOptions),
				value
			}
		}

		return {
			name: key,
			readOnly: true,
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
			path: FormKey<T>
			errors: string[]
		}>
	) => {
		const { errors, form, touches } = stateRef.current
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
			const nativeIsValid = formState.isValid;

			return (
				options?.isValid && options?.isValid({
					form: stateRef.current.form, 
					errors: stateRef.current.errors,
					touches: stateRef.current.touches,
					formState,
					isValid: nativeIsValid,
					isTouched: formState.isTouched
				})
			) ?? nativeIsValid
		},
		touches: state.touches,
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
		watch,
		updateController,
		undo,
		redo
		// #endregion Form actions
	}

	getFormRef.current = result;

	return result;
}
