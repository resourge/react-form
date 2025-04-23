import {
	useEffect,
	type BaseSyntheticEvent,
	type ChangeEvent,
	type Dispatch,
	type FormEvent,
	type MouseEvent,
	type MutableRefObject,
	type SetStateAction
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

import { createErrors } from './createErrors';
import { createTriggers } from './createTriggers';
import { setFormProxy } from './getProxy/getProxy';
import type { OnKeyTouch } from './getProxy/getProxyTypes';
import { TARGET_VALUE } from './getProxy/getProxyUtils';
import { isClass, mergeKeys } from './utils';

export type FormCoreConfig<T extends Record<string, any>, FT extends FormTypes> = {
	context: {
		formState: UseFormReturn<T, any>
		formValue: T
		onRender: OnRenderType
	} & FormCoreOptions<T>
	type: FT
	defaultValue?: T | (() => T) | ((new() => T))
	formFieldKey?: FormKey<T>
	onKeyTouch?: OnKeyTouch
	value?: any
};

export function createFormCore<T extends Record<string, any>, FT extends FormTypes = 'form'>(
	{
		state, 
		isRenderingRef, 
		config: { 
			defaultValue, 
			context, 
			type, 
			formFieldKey = '' as FormKey<T>,
			value
		}
	}: {
		config: FormCoreConfig<T, FT>
		isRenderingRef: MutableRefObject<boolean>
		state: [number, Dispatch<SetStateAction<number>>]
	}
) {
	const onRender: OnRenderType = {
		renderKeys: new Map<string, boolean>(),
		isRendering: false
	};

	const isForm = type === 'form'; 

	const {
		stateRef = {
			formErrors: {} as FormErrors<T>,
			errors: [],
			diff: [],
			preventStateUpdate: false,
			verifyErrors: () => {
				if ( shouldUpdateErrorsRef.current ) {
					shouldUpdateErrorsRef.current = false;
					const res = formValidate(formValue, getChangedKeys());
					res instanceof Promise ? res.then(renderNewErrors) : setErrors(res);
				}
			},
			hasTouch: new WeakMap(),
			touch: new WeakMap(),
			formRender: new Map()
		}, 
		formOptions, 
		touchHook,
		contextKey
	} = context;
	
	const formValue = (
		isForm 
			? (
				typeof defaultValue === 'function' 
					? (
						isClass(defaultValue) 
							? new (defaultValue as new () => T)() 
							: (defaultValue as () => T)()
					) : defaultValue
			) 
			: value
	) as T;

	const {
		touchesRef, changedKeysRef, shouldUpdateErrorsRef, 
		setTouch, changeTouch
	} = touchHook;
	const {
		onChange, onSubmit, validationType, watch, validate
	} = formOptions;

	const formKey = mergeKeys(contextKey, formFieldKey) as FormKey<T>;

	if ( !stateRef.formRender.has(formKey) ) {
		stateRef.formRender.set(formKey, []);
	}

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const formRender = stateRef.formRender.get(formKey)!;
	formRender.push(onRender);

	const resolveKey = (key: string): FormKey<T> => mergeKeys(formKey, key) as FormKey<T>;

	const hasTouch = <Model extends Record<string, any> = T>(key: FormKey<Model>): boolean => {
		onRender.renderKeys.set(key, true);
		return touchesRef.current.get(key)?.touch ?? false;
	};

	const {
		triggerRender, triggers, removeForm
	} = createTriggers({
		isForm,
		formKey,
		onRender,
		state,
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		triggers: context.triggers!
	});

	const form = setFormProxy<T>(
		formValue,
		{
			onKeyTouch: async (key, metadata) => {
				if ( metadata?.isArray ) {
					if (!metadata.touch) {
						onRender.renderKeys.set(key, onRender.renderKeys.get(key) ?? false);
						// no touch means it was deleted
						touchesRef.current
						.forEach((_, touchKey) => {
							if ( touchKey.startsWith(key) ) {
								touchesRef.current.delete(touchKey);
							}
						});
					}
					else {
						// With touch means the value changed index to it need to update
						metadata.touch.touch
						.forEach(([oldKey, value]) => {
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							touchesRef.current.set(oldKey.replace(metadata.touch!.key, key), value);
						});
					}
				}
		
				changeTouch(
					key as FormKey<T>, 
					(metadata && metadata.isArray ? touchesRef.current.get(key)?.touch : undefined)
				);
				
				if (watch?.[key as keyof typeof watch]) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					await watch[key as keyof typeof watch]!(form);
				}
		
				onChange?.(form);
		
				if ( !stateRef.preventStateUpdate ) {
					triggerRender(key);
				}
			},
			onKeyGet: (key) => isRenderingRef.current && onRender.renderKeys.set(key, onRender.renderKeys.get(key) ?? false),
			
			touchesRef,
			proxyCache: new WeakMap(),
			cache: stateRef
		},
		formKey
	);

	const {
		getErrors, hasError, validateSubmission, setErrors, formValidate
	} = createErrors({
		validate,
		touchHook,
		stateRef,
		validationType,
		resolveKey,
		onRender,
		shouldIncludeError: formKey 
			? (key: string) => key.includes(formKey) || formKey.includes(key)
			: undefined
	});

	const renderNewErrors = (errors: ValidationErrors) => {
		if ( setErrors(errors) ) {
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
	
			changedKeysRef.current.add(path);
		});
	
		renderNewErrors([
			...stateRef.errors, 
			...newErrors.flatMap(({ path, errors }) => 
				errors.map((error) => ({
					path,
					error 
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
		(Object.keys(newFrom.length ? newFrom : form) as Array<keyof T>)
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

	const getParsedValue = (value: T[FormKey<T>] | ChangeEvent, onFieldChange?: (value: any) => any) => {
		const parsedValue = (
			(value as ChangeEvent<HTMLInputElement> & { nativeEvent?: { text?: string } })?.nativeEvent?.text
			?? (value as ChangeEvent<HTMLInputElement>)?.currentTarget?.value
			?? value
		);
	
		return onFieldChange ? onFieldChange(parsedValue) : parsedValue as T[FormKey<T>];
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

		let onChangeFn = (value: T[FormKey<T>] | ChangeEvent) => form[name] = getParsedValue(value, fieldOptions.onChange);

		if ( fieldOptions.debounce ) {
			if ( !debounces.has(name) ) {
				debounces.set(name, {
					timeout: undefined,
					value
				} as unknown as DebounceOptions);
			}
	
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const deb: DebounceOptions = debounces.get(name)!;
				
			value = deb.value;

			onChangeFn = (value: T[FormKey<T>] | ChangeEvent) => {
				const parsedVal = getParsedValue(value, fieldOptions.onChange);
				if (parsedVal === deb.value) return;

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
				name,
				onChange: (value: T[FormKey<T>] | ChangeEvent) => {
					stateRef.preventStateUpdate = true;

					onChangeFn(value);

					stateRef.preventStateUpdate = false;
				},
				onBlur: () => {
					const key = resolveKey(name);
					return hasTouch(key) && triggerRender(key);
				},
				defaultValue: value
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
	) => async (e?: FormEvent<HTMLFormElement> | MouseEvent<any, MouseEvent> | BaseSyntheticEvent) => {
		e?.preventDefault?.();
	
		// This serves so onlyOnTouch validations still work on handleSubmit
		changedKeysRef.current.add('*' as FormKey<T>);
	
		const errors = await validateSubmission(form, getChangedKeys(), validateErrors);
		if ( errors.length ) {
			renderNewErrors(errors);
			// eslint-disable-next-line @typescript-eslint/only-throw-error
			throw errors;
		}
		
		triggerRender(formKey);

		onSubmit?.(form);
	
		return await onValid(form);
	};

	// Necessary for references
	const formState: UseFormReturn<T, FT> = {
		form,
		get context() {
			return formContext;
		},
		get errors() {
			return stateRef.formErrors[formKey]?.formErrors ?? {};
		},
		get isValid(): boolean {
			return !hasError('' as FormKey<T>, {
				includeChildsIntoArray: true 
			});
		},
		get isTouched() {
			return hasTouch(formKey);
		},
		changeValue: (key: FormKey<T>, value: any) => form[key] = value,
		getValue: (key: FormKey<T>) => form[key],
		reset,
		field,
		getErrors,
		hasError,
		setError,
		handleSubmit,
		hasTouch: (key) => hasTouch(resolveKey(key)),
		
		resetTouch: () => {
			resetTouch();
			triggerRender(formKey);
		},
		updateController: changeTouch
	};

	// Necessary for references
	const formContext: FormContextType<T, FT> = {
		formState,
		type,
		get changedKeys() {
			return getChangedKeys();
		},
		
		touchHook, 
		formOptions,
		stateRef,
		contextKey: formKey,
		triggers,
		onRender,
		formValue,
		getFormSplitterValue: (key) => {
			const hasRenderKeys = onRender.renderKeys.has(key);

			const value = form[key]?.[TARGET_VALUE];

			if ( !hasRenderKeys ) {
				onRender.renderKeys.delete(resolveKey(key));
			}

			return value;
		},
		toJSON() {
			return {
				...this,
				formState: `[Prevent circular dependency]`
			};
		}
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
