import {
	type BaseSyntheticEvent,
	type ChangeEvent,
	type Dispatch,
	type MouseEvent,
	RefObject,
	type SetStateAction,
	SubmitEvent,
	useEffect
} from 'react';

import type {
	FieldForm,
	FieldFormReturn,
	FieldOptions,
	FormErrors,
	FormKey,
	ResetMethod,
	SubmitHandler
} from '../types';
import type { ValidationErrors } from '../types/errorsTypes';
import type {
	FormContextType,
	FormTypes,
	UseFormReturn,
	ValidateSubmissionErrors
} from '../types/formTypes';
import type { DebounceOptions, FormCoreOptions, OnRenderType } from '../types/types';
import type { OnKeyTouch } from './getProxy/getProxyTypes';

import { createErrors } from './createErrors';
import { createTriggers } from './createTriggers';
import { setFormProxy } from './getProxy/getProxy';
import { TARGET_VALUE } from './getProxy/getProxyUtils';
import { isClass, mergeKeys, setSubmitDeepKeys } from './utils';

export type FormCoreConfig<T extends Record<string, any>, FT extends FormTypes> = {
	context: FormCoreOptions<T> & {
		formState: UseFormReturn<T, any>
		formValue: T
		onRender: OnRenderType
	}
	defaultValue?: (() => T) | (new() => T) | (T)
	formFieldKey?: FormKey<T>
	onKeyTouch?: OnKeyTouch
	type: FT
	value?: any
};

export function createFormCore<T extends Record<string, any>, FT extends FormTypes = 'form'>(
	{
		config: { 
			context, 
			defaultValue, 
			formFieldKey = '' as FormKey<T>, 
			type,
			value
		}, 
		isRenderingRef, 
		state
	}: {
		config: FormCoreConfig<T, FT>
		isRenderingRef: RefObject<boolean>
		state: [number, Dispatch<SetStateAction<number>>]
	}
) {
	const onRender: OnRenderType = {
		isRendering: false,
		renderKeys: new Map<string, boolean>()
	};

	/**
	 * Validates the form
	 * @param form Current State
	 * @param changedKeys Keys that have changed
	 * @returns New validated state
	 */
	const formValidate = (form: T, changedKeys: Array<FormKey<T>>): Promise<ValidationErrors> | ValidationErrors => validate?.(form, changedKeys) ?? [];

	const {
		contextKey, 
		formOptions, 
		stateRef = {
			diff: [],
			errors: [],
			formErrors: {} as FormErrors<T>,
			formRender: new Map(),
			hasTouch: new WeakMap(),
			preventStateUpdate: false,
			touch: new WeakMap(),
			validateSubmission: async function (shouldIncludeError, validateErrors) {
				let newErrors = await formValidate(
					form,
					getChangedKeys()
				);

				if ( shouldIncludeError ) {
					newErrors = newErrors
					.filter((val) => shouldIncludeError(val.path));
				}
				
				if ( validateErrors ) {
					const result = await validateErrors(newErrors);
				
					if ( typeof result === 'boolean' ) {
						if ( !result ) {
							// eslint-disable-next-line @typescript-eslint/only-throw-error
							throw newErrors;
						}
								
						newErrors = [];
					}
					else {
						newErrors = result;
					}
				}
				
				if ( validationType === 'always' ) {
					return newErrors;
				}
				
				const isSubmitValidation = validationType === 'onSubmit';
				
				if ( isSubmitValidation ) {
					setSubmitDeepKeys({
						obj: form,
						resolveKey: resolveKey,
						shouldIncludeError: shouldIncludeError,
						touches: touchesRef.current
					});
				}
				
				newErrors
				.forEach(({ error, path }) => {
					if ( 
						!changedKeysRef.current.has(path as FormKey<T>) 
						&& !(
							this.errors
							.some((prevVal) => (
								prevVal.path === path
								&& error === prevVal.error
							))
						)
					) {
						setTouch(path as FormKey<T>, false, true);
						changedKeysRef.current.add(path as FormKey<T>);
					}
				});
				
				return newErrors;
			},
			verifyErrors: () => {
				if ( shouldUpdateErrorsRef.current ) {
					shouldUpdateErrorsRef.current = false;
					const res = formValidate(formValue, getChangedKeys());
					res instanceof Promise
						? res.then(renderNewErrors)
						: setErrors(res);
				}
			}
		},
		touchHook
	} = context;
	
	const formValue = (
		type === 'form' 
			? (
				typeof defaultValue === 'function' 
					? (
						isClass(defaultValue) 
							? new (defaultValue as new () => T)() 
							: (defaultValue as () => T)()
					)
					: defaultValue
			) 
			: value
	) as T;

	const {
		changedKeysRef, changeTouch, setTouch, 
		shouldUpdateErrorsRef, touchesRef
	} = touchHook;
	const {
		onChange, onSubmit, validate, validationType = 'onSubmit', watch
	} = formOptions;

	const formKey = mergeKeys(contextKey, formFieldKey) as FormKey<T>;

	if ( !stateRef.formRender.has(formKey) ) {
		stateRef.formRender.set(formKey, []);
	}

	const formRender = stateRef.formRender.get(formKey)!;
	formRender.push(onRender);

	const resolveKey = (key: string): FormKey<T> => mergeKeys(formKey, key) as FormKey<T>;

	const hasTouch = <Model extends Record<string, any> = T>(key: FormKey<Model>): boolean => {
		onRender.renderKeys.set(key, true);
		return touchesRef.current.get(key)?.touch ?? false;
	};

	const {
		removeForm, triggerRender, triggers
	} = createTriggers({
		formKey,
		onRender,
		state,
		triggers: context.triggers!
	});

	const _onChange = onChange 
		? debounce(onChange)
		: undefined;

	const form = setFormProxy<T>(
		formValue,
		{
			cache: stateRef,
			onKeyGet: (key) => isRenderingRef.current && onRender.renderKeys.set(key, onRender.renderKeys.get(key) ?? false),
			
			onKeyTouch: async (key, metadata) => {
				if ( metadata?.isArray ) {
					if (metadata.touch) {
						// With touch means the value changed index to it need to update
						metadata.touch.touch
						.forEach(([oldKey, value]) => {
							touchesRef.current.set(oldKey.replace(metadata.touch!.key, key), value);
						});
					}
					else {
						onRender.renderKeys.set(key, onRender.renderKeys.get(key) ?? false);
						// no touch means it was deleted
						touchesRef.current
						.forEach((_, touchKey) => {
							if ( touchKey.startsWith(key) ) {
								touchesRef.current.delete(touchKey);
							}
						});
					}
				}
		
				if ( !stateRef.preventStateUpdate ) {
					changeTouch(
						key as FormKey<T>, 
						(
							metadata && metadata.isArray 
								? touchesRef.current.get(key)?.touch 
								: undefined
						)
					);
				}
				
				if (watch?.[key as keyof typeof watch]) {
					await watch[key as keyof typeof watch]!(form);
				}
		
				_onChange?.(form);
		
				if ( !stateRef.preventStateUpdate ) {
					triggerRender(key);
				}
			},
			proxyCache: new WeakMap(),
			touchesRef
		},
		formKey
	);

	const {
		getErrors, hasError, setErrors
	} = createErrors({
		onRender,
		resolveKey,
		stateRef,
		touchHook,
		validationType
	});

	const renderNewErrors = (errors: ValidationErrors, isFromSubmission?: boolean) => {
		if ( setErrors(errors, isFromSubmission) ) {
			triggerRender(formKey);
		}
	};
	
	const setError = (
		newErrors: Array<{
			errors: string[]
			path: FormKey<T>
		}>
	) => {
		newErrors.forEach(({ path }) => {
			setTouch(
				path, 
				form[path], 
				true
			);

			touchHook.touchesRef.current.get(path)!.errorWasShown = true;
	
			changedKeysRef.current.add(path);
		});
	
		renderNewErrors([
			...stateRef.errors, 
			...newErrors.flatMap(({ errors, path }) => 
				errors.map((error) => ({
					error,
					path 
				}))
			) 
		]); 
	};

	const getChangedKeys = () => Array.from(changedKeysRef.current);

	const resetTouch = () => {
		formKey
			? touchesRef.current.forEach((_, key) => key.startsWith(formKey) && touchesRef.current.delete(key))
			: touchesRef.current.clear();
	};

	const reset: ResetMethod<T> = (
		newFrom = {}, 
		{ clearTouched = true } = {}
	) => {
		stateRef.preventStateUpdate = true;

		// Needs to be like this, otherwise it looses Class instance
		(Object.keys((newFrom as NonNullable<T>).length > 0
			? newFrom
			: form) as Array<keyof T>)
		.forEach((key) => form[key] = newFrom[key] as T[keyof T]);

		if ( clearTouched ) {
			resetTouch();
		}

		triggerRender(formKey);

		stateRef.preventStateUpdate = false;
	};

	const debounces = new Map<
		string, 
		DebounceOptions
	>();

	const getParsedValue = (value: ChangeEvent | T[FormKey<T>], onFieldChange?: (value: any) => any) => {
		const parsedValue = (
			(value as ChangeEvent<HTMLInputElement> & { nativeEvent?: { text?: string } })?.nativeEvent?.text
			?? (value as ChangeEvent<HTMLInputElement>)?.currentTarget?.value
			?? value
		);
	
		return onFieldChange
			? onFieldChange(parsedValue)
			: parsedValue as T[FormKey<T>];
	};

	const field = ((
		name: FormKey<T>, 
		fieldOptions: FieldOptions = {}
	): FieldFormReturn => {
		let value = form[name];

		if ( fieldOptions.readOnly ) {
			return {
				name,
				readOnly: true,
				value
			};
		}

		let onChangeFn = (value: ChangeEvent | T[FormKey<T>]) => form[name] = getParsedValue(value, fieldOptions.onChange);

		if ( fieldOptions.debounce ) {
			if ( !debounces.has(name) ) {
				debounces.set(name, {
					timeout: undefined,
					value
				} as unknown as DebounceOptions);
			}
			
			const deb: DebounceOptions = debounces.get(name)!;
				
			value = deb.value;

			onChangeFn = (value: ChangeEvent | T[FormKey<T>]) => {
				const parsedVal = getParsedValue(value, fieldOptions.onChange);
				if (parsedVal === deb.value) {
					return; 
				}

				deb.value = parsedVal;
				clearTimeout(deb.timeout);
					
				deb.timeout = setTimeout(() => {
					debounces.delete(name);
					form[name] = deb.value;
				}, fieldOptions.debounce);
				
				// To update current component only
				triggerRender(resolveKey(name));
			};
		}
				
		if ( fieldOptions.blur ) {
			return {
				defaultValue: value,
				name,
				onBlur: () => {
					const key = resolveKey(name);
					return hasTouch(key) && triggerRender(key);
				},
				onChange: (value: ChangeEvent | T[FormKey<T>]) => {
					stateRef.preventStateUpdate = true;

					onChangeFn(value);

					stateRef.preventStateUpdate = false;
				}
			};
		}

		return {
			name,
			onChange: onChangeFn,
			value
		};
	}) as FieldForm<T>;

	const handleSubmit = <K = void>(
		onValid: SubmitHandler<T, K>,
		validateErrors?: ValidateSubmissionErrors
	) => async (e?: BaseSyntheticEvent | MouseEvent<any, MouseEvent> | SubmitEvent<HTMLFormElement>) => {
		stateRef.preventStateUpdate = true;
		try {
			e?.preventDefault?.();
	
			// This serves so onlyOnTouch validations still work on handleSubmit
			changedKeysRef.current.add('*' as FormKey<T>);
	
			const shouldIncludeError = formKey 
				? (key: string) => key.includes(formKey) || formKey.includes(key)
				: undefined;

			const errors = await stateRef.validateSubmission(shouldIncludeError, validateErrors);

			if ( errors.length > 0 ) {
				renderNewErrors(errors, true);
				// eslint-disable-next-line @typescript-eslint/only-throw-error
				throw errors;
			}

			touchHook.touchesRef.current.forEach((touch) => {
				touch.touch = false;
			});
		
			triggerRender(formKey);

			onSubmit?.(form);
	
			return await onValid(form);
		}
		finally {
			stateRef.preventStateUpdate = false;
		}
	};

	// Necessary for references
	const formState: UseFormReturn<T, FT> = {
		changeValue: (key: FormKey<T>, value: any) => form[key] = value,
		get context() {
			return formContext;
		},
		get errors() {
			return stateRef.formErrors[formKey]?.formErrors ?? {};
		},
		field,
		form,
		getErrors,
		getValue: (key: FormKey<T>) => form[key],
		handleSubmit,
		hasError,
		hasTouch: (key) => hasTouch(resolveKey(key)),
		get isTouched() {
			return hasTouch(formKey);
		},
		get isValid(): boolean {
			return !hasError('' as FormKey<T>, {
				includeChildsIntoArray: true 
			});
		},
		reset,
		resetTouch: () => {
			resetTouch();
			triggerRender(formKey);
		},
		
		setError,
		updateController: changeTouch
	};

	// Necessary for references
	const formContext: FormContextType<T, FT> = {
		get changedKeys() {
			return getChangedKeys();
		},
		contextKey: formKey,
		formOptions,
		
		formState, 
		formValue,
		getFormSplitterValue: (key) => {
			const hasRenderKeys = onRender.renderKeys.has(key);

			const value = form[key]?.[TARGET_VALUE];

			if ( !hasRenderKeys ) {
				onRender.renderKeys.delete(resolveKey(key));
			}

			return value;
		},
		onRender,
		stateRef,
		toJSON() {
			return {
				...this,
				formState: `[Prevent circular dependency]`
			};
		},
		touchHook,
		triggers,
		type
	};

	return () => {
		useEffect(() => () => {
			const index = formRender.indexOf(onRender);

			if (index !== -1) {
				formRender.splice(index, 1);
			};

			if ( formRender.length === 0 ) {
				stateRef.formRender.delete(formKey);
			}
			removeForm();
		}, []);
		
		// This serves to update components that don't have changes 
		// but have new errors
		useEffect(() => {
			const diff = stateRef.diff;
			stateRef.diff = [];
		
			diff.forEach(({ path }) => {
				triggerRender(path);
			});
			onRender.isRendering = false;
		});
			
		// Check to see if there is new errors
		stateRef.verifyErrors();
		
		// Clear keys for a new render
		onRender.renderKeys.clear();

		return formState;
	};
}

function debounce(func: (form: any) => any, timeout = 200) {
	const state: { 
		args: any
		timer: NodeJS.Timeout
	} = {
		args: undefined,
		timer: null as unknown as NodeJS.Timeout
	};
	return (form: any) => {
		state.args = form;
		clearTimeout(state.timer);
		state.timer = setTimeout(() => func(state.args), timeout);
	};
}
