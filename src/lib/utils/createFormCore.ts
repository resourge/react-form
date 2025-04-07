import {
	type Dispatch,
	type MutableRefObject,
	type SetStateAction,
	type ChangeEvent,
	type FormEvent,
	type MouseEvent,
	type BaseSyntheticEvent
} from 'react';

import {
	type FieldForm,
	type FieldFormReturn,
	type FieldOptions,
	type FormErrors,
	type FormKey,
	type ResetMethod,
	type SubmitHandler
} from '../types';
import { type ValidationErrors } from '../types/errorsTypes';
import {
	type FormContextType,
	type FormTypes,
	type UseFormReturn,
	type ValidateSubmissionErrors
} from '../types/formTypes';
import { type DebounceOptions, type FormCoreOptions } from '../types/types';

import { createErrors } from './createErrors';
import { createTriggers } from './createTriggers';
import { setFormProxy } from './getProxy/getProxy';
import { type CacheConfig, type OnKeyTouch } from './getProxy/getProxyTypes';
import { TARGET_VALUE } from './getProxy/getProxyUtils';
import { isClass, mergeKeys } from './utils';

export type FormCoreConfig<T extends Record<string, any>, FT extends FormTypes> = {
	context: {
		cacheConfig: CacheConfig
		formState: UseFormReturn<T, any>
	} & FormCoreOptions<T>
	type: FT
	defaultValue?: T | (() => T) | ((new() => T))
	formFieldKey?: FormKey<T>
	onKeyTouch?: OnKeyTouch
};

export function createFormCore<T extends Record<string, any>, FT extends FormTypes = 'form'>(
	{
		state, 
		isRenderingRef, 
		keysOnRender,
		config: { 
			defaultValue, 
			context, 
			type, 
			formFieldKey = '' as FormKey<T>
		}
	}: {
		config: FormCoreConfig<T, FT>
		isRenderingRef: MutableRefObject<boolean>
		keysOnRender: MutableRefObject<Set<string>>
		state: [number, Dispatch<SetStateAction<number>>]
	}
) {
	const {
		stateRef = {
			formErrors: {} as FormErrors<T>,
			errors: [],
			preventStateUpdate: false
		}, 
		formOptions, 
		touchHook,
		contextKey,
		cacheConfig = {
			hasTouch: new WeakMap(),
			touch: new WeakMap()
		}
	} = context;

	const {
		touchesRef, changedKeysRef, shouldUpdateErrorsRef, 
		hasTouch, setTouch, changeTouch
	} = touchHook;
	const {
		onChange, onSubmit, validationType, watch, validate
	} = formOptions;

	const formKey = mergeKeys(contextKey, formFieldKey) as FormKey<T>;

	const resolveKey = (key: string): FormKey<T> => mergeKeys(formKey, key) as FormKey<T>;

	const isForm = type === 'form'; 

	const {
		triggerRender, triggers, removeForm
	} = createTriggers({
		isForm,
		formKey,
		keysOnRender,
		state,
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		triggers: context.triggers!,
		resetFormCore: () => form.reStartProxy()
	});

	const form = setFormProxy<T>(
		() => (
			formFieldKey
				// In formSplitter case
				? context.formState.getValue(formFieldKey)?.[TARGET_VALUE]
				: (
					// In form case
					defaultValue
						? (
							typeof defaultValue === 'function' 
								? (
									isClass(defaultValue) 
										? new (defaultValue as new () => T)() 
										: (defaultValue as () => T)()
								) : defaultValue
						)
						// In context case
						: (context.formState.form as any)[TARGET_VALUE]
				)
		) as T,
		{
			onKeyTouch: async (key, metadata) => {
				if ( metadata?.isArray ) {
					if (!metadata.touch) {
						keysOnRender.current.add(key);
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
					(metadata && metadata.isArray ? hasTouch(key as FormKey<T>) : undefined)
				);
		
				if ( watch ) {
					const res = watch?.[key as keyof typeof watch]?.(form.proxy);
					if ( res instanceof Promise ) {
						// eslint-disable-next-line no-await-in-loop
						await res;
					}
				}
		
				onChange?.(form.proxy);
		
				if ( !stateRef.preventStateUpdate ) {
					triggerRender(key);
				}
			},
			onKeyGet: (key) => isRenderingRef.current && keysOnRender.current.add(key),
			
			touchesRef,
			proxyCache: new WeakMap(),
			cache: cacheConfig
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
		keysOnRender,
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
				form.proxy[path], 
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

	const verifyErrors = () => {
		if ( shouldUpdateErrorsRef.current ) {
			shouldUpdateErrorsRef.current = false;
			const res = formValidate(form.proxy, getChangedKeys());
			res instanceof Promise ? res.then(renderNewErrors) : setErrors(res);
		}
	};

	const resetTouch = () => {
		if ( formKey ) {
			return touchesRef.current
			.forEach((_, key) => {
				if ( key.startsWith(formKey) ) {
					touchesRef.current.delete(key);
				}
			});
		}

		touchesRef.current.clear();
	};

	const reset: ResetMethod<T> = (
		newFrom = {}, 
		{ clearTouched = true } = {}
	) => {
		stateRef.preventStateUpdate = true;

		// Needs to be like this, otherwise it looses Class instance
		(Object.keys(newFrom.length ? newFrom : form.proxy) as Array<keyof T>)
		.forEach((key) => form.proxy[key] = newFrom[key] as T[keyof T]);

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
		let value = form.proxy[name];

		if ( fieldOptions.readOnly ) {
			return {
				name,
				readOnly: true,
				value
			};
		}

		let onChangeFn = (value: T[FormKey<T>] | ChangeEvent) => form.proxy[name] = getParsedValue(value, fieldOptions.onChange);

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
					form.proxy[name] = deb.value;
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
	
		const newErrors = await validateSubmission(form.proxy, getChangedKeys(), validateErrors);
		if ( newErrors.length ) {
			renderNewErrors(newErrors);
			// eslint-disable-next-line @typescript-eslint/only-throw-error
			throw newErrors;
		}
		
		triggerRender(formKey);

		onSubmit?.(form.proxy);
	
		return await onValid(form.proxy);
	};

	// Necessary for references
	const formState: UseFormReturn<T, FT> = {
		get form() {
			return form.proxy;
		},
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
		changeValue: (key: FormKey<T>, value: any) => form.proxy[key] = value,
		getValue: (key: FormKey<T>) => form.proxy[key],
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
		keysOnRender,
		toJSON() {
			return {
				...this,
				formState: `[Prevent circular dependency]`
			};
		},
		cacheConfig
	};

	return [
		formState, 
		verifyErrors,
		removeForm
	] as const;
}
