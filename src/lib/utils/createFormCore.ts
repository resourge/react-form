import { type ChangeEvent, type FormEvent } from 'react';

import {
	type FieldForm,
	type FieldFormReturn,
	type FieldOptions,
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
import { type DebounceOptions } from '../types/types';

import { createErrors } from './createErrors';
import { observeObject, type OnKeyTouch, type ValueMetadataType } from './observeObject/observeObject';
import { createTriggers, isClass, mergeKeys } from './utils';

export type FormCoreConfig<T extends Record<string, any>, FT extends FormTypes> = {
	context: Omit<FormContextType<T, FT>, 'changedKeys' | 'toJSON' | 'type' | 'formState'>
	defaultValue: T | (() => T) | ((new() => T))
	type: FT
	baseKey?: FormKey<T>
	onKeyTouch?: OnKeyTouch
};

export function createFormCore<T extends Record<string, any>, FT extends FormTypes = 'form'>(
	{
		state, 
		isRenderingRef, 
		keysOnRender,
		config: { 
			defaultValue, 
			context: options, 
			type, 
			baseKey: formFieldKey = '' as FormKey<T>
		}
	}: {
		config: FormCoreConfig<T, FT>
		isRenderingRef: React.MutableRefObject<boolean>
		keysOnRender: React.MutableRefObject<Set<string>>
		state: [number, React.Dispatch<React.SetStateAction<number>>]
	}
) {
	const preventStateUpdateRef = {
		current: false 
	};
	const validationErrorsRef = {
		current: [] as ValidationErrors
	};
	const {
		errorRef, formOptions, touchHook 
	} = options;
	const {
		touchesRef, changedKeysRef, 
		hasTouch, setTouch, changeTouch, shouldUpdateErrorsRef
	} = touchHook;
	const {
		onChange, onSubmit, validationType = 'onSubmit', watch
	} = formOptions;

	const formKey = mergeKeys(options.baseKey, formFieldKey) as FormKey<T>;

	const resolveKey = (key: string): FormKey<T> => mergeKeys(formKey, key) as FormKey<T>;

	const {
		triggerRender, triggers, removeForm 
	} = createTriggers(
		type,
		formKey,
		keysOnRender,
		state,
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		options.triggers!
	);

	const form = observeObject<T>(
		(
			typeof defaultValue === 'function' 
				? (
					isClass(defaultValue) 
						? new (defaultValue as new () => T)() 
						: (defaultValue as () => T)()
				) : defaultValue
		),
		{
			onKeyTouch: type === 'formSplitter'
				? (key: string) => {
					const _key = resolveKey(key);
					triggers.formTrigger(_key);
	
					if ( !preventStateUpdateRef.current ) {
						triggerRender(_key);
					}
				} 
				: async (key: string, metadata?: ValueMetadataType) => {
					if ( metadata?.isArray ) {
						metadata.touch?.touch
						.forEach(([oldKey, value]) => {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							touchesRef.current.set(oldKey.replace(metadata.touch!.key, key), value);
						});
						if (!metadata.touch) {
							touchesRef.current
							.forEach((_, touchKey) => {
								if ( touchKey.startsWith(key) ) {
									touchesRef.current.delete(touchKey);
								}
							});
						}
					}
	
					changeTouch(
						key as FormKey<T>, 
						(metadata && metadata.isArray ? hasTouch(key as FormKey<T>) : undefined)
					);
	
					if ( watch ) {
						const res = watch?.[key as keyof typeof watch]?.(form);
						if ( res instanceof Promise ) {
							// eslint-disable-next-line no-await-in-loop
							await res;
						}
					}
	
					onChange?.(form);
	
					if ( !preventStateUpdateRef.current ) {
						triggerRender(key);
					}
				},
			getTouches: (key: string) => Array.from(touchesRef.current).filter(([touchKey]) => touchKey.startsWith(key)),
			isRenderingRef,
			onKeyGet: (key) => isRenderingRef.current && keysOnRender.current.add(resolveKey(key))
		}
	);

	const {
		getErrors, hasError, validateSubmission, setErrors, formValidate
	} = createErrors({
		...options,
		validationErrorsRef,
		validationType,
		resolveKey,
		keysOnRender,
		shouldIncludeError: (key: string) => key.includes(formKey) || formKey.includes(key)
	});

	const renderNewErrors = (errors: ValidationErrors) => setErrors(errors) && triggerRender();
	
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
				true, 
				validationType === 'onSubmit'
			);
	
			changedKeysRef.current.add(path);
		});
	
		renderNewErrors([
			...validationErrorsRef.current, 
			...newErrors.flatMap(({ path, errors }) => 
				errors.map((error) => ({
					path,
					error 
				}))
			) 
		]); 
	};

	const getChangedKeys = () => Array.from(changedKeysRef.current);

	const verifyErrors = type === 'form' 
		? () => {
			if ( shouldUpdateErrorsRef.current ) {
				const res = formValidate(form, getChangedKeys());
				res instanceof Promise ? res.then(renderNewErrors) : setErrors(res);
			}
		} : () => {};

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
		newFrom, 
		{ clearTouched = true } = {}
	) => {
		preventStateUpdateRef.current = true;

		// Needs to be like this, otherwise it looses Class instance
		(Object.keys(newFrom) as Array<keyof T>)
		.forEach((key) => form[key] = newFrom[key] as T[keyof T]);

		if ( clearTouched ) {
			resetTouch();
		}
		triggerRender();

		preventStateUpdateRef.current = false;
	};

	const debounces = new Map<
		string, 
		DebounceOptions
	>();

	const getParsedValue = (value: T[FormKey<T>] | ChangeEvent, onChange?: (value: any) => any) => {
		const parsedValue = (
			(value as ChangeEvent<HTMLInputElement> & { nativeEvent?: { text?: string } })?.nativeEvent?.text
			?? (value as ChangeEvent<HTMLInputElement>)?.currentTarget?.value
			?? value
		);
	
		return onChange ? onChange(parsedValue) : parsedValue as T[FormKey<T>];
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

		let onChangeFn = (value: T[FormKey<T>] | ChangeEvent) => form[name] = getParsedValue(value, onChange);

		if ( fieldOptions.debounce ) {
			let deb: DebounceOptions = debounces.get(name) ?? {
				timeout: undefined,
				value
			} as unknown as DebounceOptions;

			if (!deb) {
				deb = {
					timeout: undefined,
					value 
				} as unknown as DebounceOptions;
				debounces.set(name, deb);
			}
				
			value = deb.value;

			onChangeFn = (value: T[FormKey<T>] | ChangeEvent) => {
				const parsedVal = getParsedValue(value, onChange);
				if (parsedVal === deb.value) return;

				deb.value = parsedVal;
				clearTimeout(deb.timeout);
					
				deb.timeout = setTimeout(() => {
					debounces.delete(name);
					form[name] = deb.value;
				}, fieldOptions.debounce);
				
				triggerRender();
			};
		}
				
		if ( fieldOptions.blur ) {
			return {
				name,
				onChange: (value: T[FormKey<T>] | ChangeEvent) => {
					preventStateUpdateRef.current = true;

					onChangeFn(value);

					preventStateUpdateRef.current = false;
				},
				onBlur: () => hasTouch(resolveKey(name)) && triggerRender(name),
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
	) => async (e?: FormEvent<HTMLFormElement> | React.MouseEvent<any, React.MouseEvent> | React.BaseSyntheticEvent) => {
		e?.preventDefault?.();
	
		// This serves so onlyOnTouch validations still work on handleSubmit
		changedKeysRef.current.add('*' as FormKey<T>);
	
		const newErrors = await validateSubmission(form, getChangedKeys(), validateErrors);
		if ( newErrors.length ) {
			renderNewErrors(newErrors);
			// eslint-disable-next-line @typescript-eslint/only-throw-error
			throw newErrors;
		}
		
		triggerRender();

		onSubmit?.(form);
	
		return await onValid(form);
	};

	// Necessary for references
	const formState: UseFormReturn<T, FT> = {
		form,
		get context() {
			return context;
		},
		get errors() {
			return errorRef.current[formKey]?.formErrors ?? {};
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

			triggerRender();
		},
		updateController: changeTouch
	};

	// Necessary for references
	const context: FormContextType<T, FT> = {
		formState,
		type,
		get changedKeys() {
			return getChangedKeys();
		},
		
		touchHook, 
		formOptions,
		errorRef,
		baseKey: formKey,
		triggers,

		toJSON() {
			return {
				...this,
				formState: `[Prevent circular dependency]`
			};
		}
	};

	return [
		formState, 
		verifyErrors,
		removeForm
	] as const;
}
