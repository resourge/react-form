import { type FormEvent, type ChangeEvent } from 'react';

import {
	type FieldFormReturn,
	type FieldOptions,
	type ResetMethod,
	type FormKey,
	type FieldForm,
	type SubmitHandler
} from '../types';
import { type ValidationErrors } from '../types/errorsTypes';
import {
	type FormTypes,
	type FormContextType,
	type UseFormReturn,
	type ValidateSubmissionErrors
} from '../types/formTypes';
import { type FormCoreOptions } from '../types/types';

import { createErrors } from './createErrors';
import { observeObject, type ValueMetadataType } from './observeObject/observeObject';
import { isClass, mergeKeys } from './utils';

export type FormCoreConfig<T extends Record<string, any>, FT extends FormTypes> = {
	defaultValue: T | (() => T) | ((new() => T))
	options: FormCoreOptions<T>
	type: FT
	baseKey?: FormKey<T>
};

export function createFormCore<T extends Record<string, any>, FT extends FormTypes = 'form'>(
	{ 
		defaultValue, options, type, baseKey: formFieldKey = '' as FormKey<T>
	}: FormCoreConfig<T, FT>,
	{
		setState, 
		isRenderingRef, 
		keysOnRender
	}: {
		isRenderingRef: React.MutableRefObject<boolean>
		keysOnRender: React.MutableRefObject<Set<string>>
		setState: React.Dispatch<React.SetStateAction<number>>
	}
) {
	const preventStateUpdateRef = {
		current: false 
	};
	const validationErrorsRef = {
		current: [] as ValidationErrors
	};
	const {
		errorRef, onKeyTouch, formOptions, touchHook
	} = options;
	const {
		touchesRef, changedKeysRef, 
		hasTouch, setTouch, changeTouch, shouldUpdateErrorsRef
	} = touchHook;
	const {
		onChange, onSubmit, validationType = 'onSubmit', watch
	} = formOptions;
	const baseKey = mergeKeys(options.baseKey, formFieldKey) as FormKey<T>;

	const resolveKey = (key: string): FormKey<T> => mergeKeys(baseKey, key) as FormKey<T>;
	
	const triggerRender = (key?: string) => {
		if ( !key || !keysOnRender.current.has(key) ) {
			setState((x) => x + 1);
		}
	};

	const handleKeyTouch = onKeyTouch
		? async (key: string, metadata?: ValueMetadataType) => {
			await onKeyTouch(mergeKeys(formFieldKey, key), metadata);

			if ( !preventStateUpdateRef.current ) {
				triggerRender(key);
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
				for (const watchKey of Object.keys(watch)) {
					if ( watchKey === key ) {
						const watchFn = watch[watchKey as FormKey<T>];
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						const res = watchFn!(form);

						if ( res instanceof Promise ) {
						// eslint-disable-next-line no-await-in-loop
							await res;
						}
					}
				}
			}

			onChange?.(form);

			if ( !preventStateUpdateRef.current ) {
				triggerRender(key);
			}
		}
	;

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
			onKeyTouch: handleKeyTouch,
			getTouches: (key: string) => Array.from(touchesRef.current).filter(([touchKey]) => touchKey.startsWith(key)),
			isRendering: () => isRenderingRef.current,
			onKeyGet: (key) => isRenderingRef.current && keysOnRender.current.add(key)
		}
	);

	// #region Errors
	const {
		getErrors, hasError, validateSubmission, setErrors, formValidate
	} = createErrors({
		...options,
		validationErrorsRef,
		validationType,
		resolveKey,
		shouldIncludeError: (key: string) => key.includes(baseKey) || baseKey.includes(key)
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
	
		const _newErrors = [
			...validationErrorsRef.current
		];
	
		newErrors.forEach(({ path, errors }) => {
			errors.forEach((error) => {
				_newErrors.push({
					path,
					error
				});
			});
		});
	
		renderNewErrors( _newErrors); 
	};

	const getChangedKeys = () => Array.from(changedKeysRef.current);

	const verifyErrors = () => {
		if ( shouldUpdateErrorsRef.current ) {
			const res = formValidate(form, getChangedKeys());
			res instanceof Promise ? res.then(renderNewErrors) : setErrors(res);
		}
	};
	// #endregion Errors
	
	// #region Form functions
	const reset: ResetMethod<T> = (
		newFrom, 
		{ clearTouched = true } = {}
	) => {
		preventStateUpdateRef.current = true;

		// Needs to be like this, otherwise it looses Class instance
		(Object.keys(newFrom) as Array<keyof T>)
		.forEach((key) => form[key] = newFrom[key] as T[keyof T]);

		if ( clearTouched ) {
			touchesRef.current.clear();
		}
		triggerRender();

		preventStateUpdateRef.current = false;
	};

	const field = ((
		key: FormKey<T>, 
		fieldOptions: FieldOptions = {}
	): FieldFormReturn => {
		const value = form[key];

		if ( fieldOptions.readOnly ) {
			return {
				name: key,
				readOnly: true,
				value
			};
		}

		const onChange = (value: T[FormKey<T>] | ChangeEvent) => {
			const parsedValue = (
				(value as ChangeEvent<HTMLInputElement> & { nativeEvent?: { text?: string } })?.nativeEvent?.text
				?? (value as ChangeEvent<HTMLInputElement>)?.currentTarget?.value
				?? value
			);
		
			form[key] = fieldOptions.onChange ? fieldOptions.onChange(parsedValue) : parsedValue as T[FormKey<T>];
		};

		if ( fieldOptions.blur ) {
			return {
				name: key,
				onChange: (value: T[FormKey<T>] | ChangeEvent) => {
					preventStateUpdateRef.current = true;

					onChange(value);

					preventStateUpdateRef.current = false;
				},
				onBlur: () => hasTouch(resolveKey(key)) && triggerRender(key),
				defaultValue: value
			};
		}

		return {
			name: key,
			onChange,
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
	// #endregion Form functions

	// Necessary for references
	const formState: UseFormReturn<T, FT> = {
		form,
		get context() {
			return context;
		},
		get errors() {
			return errorRef.current[baseKey]?.formErrors ?? {};
		},
		get isValid(): boolean {
			return !hasError('' as FormKey<T>, {
				includeChildsIntoArray: true 
			});
		},
		get isTouched() {
			return hasTouch(baseKey);
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
			if ( !formFieldKey ) {
				touchesRef.current.clear();
			}
			else {
				touchesRef.current.forEach((_, key) => {
					if ( key.startsWith(formFieldKey) ) {
						touchesRef.current.delete(key);
					}
				});
			}

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
		options: {
			touchHook, 
			formOptions,
			onKeyTouch: handleKeyTouch,
			errorRef,
			baseKey
		},

		toJSON() {
			return {
				...this,
				formState: `[Prevent circular dependency]`
			};
		}
	};

	return [
		formState, 
		verifyErrors
	] as const;
}
