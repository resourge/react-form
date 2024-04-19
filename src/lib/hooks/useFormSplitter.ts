/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import invariant from 'tiny-invariant';

import { useControllerContext } from '../contexts/ControllerContext';
import { type FormContextObject, useFormContext } from '../contexts/FormContext';
import { type FormKey } from '../types/FormKey';
import { type PathValue } from '../types/PathValue';
import { type ProduceNewStateOptions, type UseFormReturn } from '../types/formTypes';
import { filterObjectByKey } from '../utils/utils';

import { useGetterSetter } from './useGetterSetter';
import { type WatchMethod } from './useWatch';

export type FormSplitterResult<
	T extends Record<string, any>,
	K = FormKey<T>
> = Omit<UseFormReturn<PathValue<T, K>>, 'context' | 'triggerChange'> 
& Pick<UseFormReturn<T>, 'context'> 
& {
	triggerChange: (
		cb: (
			(
				form: PathValue<T, K>, 
				setParentValue: (value: PathValue<T, K>) => void
			) => void
		) | (
			(
				form: PathValue<T, K>, 
				setParentValue: (value: PathValue<T, K>) => void
			) => Promise<void>
		), 
		produceOptions?: ProduceNewStateOptions | undefined
	) => void
};

/**
 * Hook to create a splitter form. Serves to create a form for the specific "formFieldKey"
 * * Note: useFormSplitter used inside a Controller doesn't need "formFieldKey" otherwise is mandatory
 * @param formFieldKey - key from `form` state 
 */
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(): FormSplitterResult<T, K>;
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(formFieldKey: K): FormSplitterResult<T, K>;
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(
	formFieldKey?: K
): FormSplitterResult<T, K> {
	const controllerContext = useControllerContext<any>();
	let context: FormContextObject<any>;
	let _formFieldKey = formFieldKey!;
	if ( controllerContext ) {
		context = controllerContext.context;
		_formFieldKey = formFieldKey ?? controllerContext.name as K;
	}
	else {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		context = useFormContext<any>();
	}

	if ( process.env.NODE_ENV === 'development' ) {
		invariant(_formFieldKey, '\'formFieldKey\' undefined can only used inside a Controller component.');
	}

	const getKey = (key: string): any => {
		return `${_formFieldKey}${key ? (key.includes('[') ? key : `.${key}`) : ''}` as FormKey<PathValue<T, K>>;
	};

	const filterKeysError = (key: string) => key.includes(_formFieldKey) || _formFieldKey.includes(key);

	const getterSetter = useGetterSetter();

	const result: FormSplitterResult<T, K> = {
		get form() {
			return context.getValue(_formFieldKey);
		},
		get errors() {
			return filterObjectByKey(context.errors, _formFieldKey);
		},
		get touches() {
			return filterObjectByKey(context.touches, _formFieldKey);
		},
		get isTouched() {
			return Object.keys(this.touches).length > 0;
		},
		get isValid() {
			return Object.keys(this.errors).length === 0;
		},
		handleSubmit: (
			onValid, 
			onInvalid
		) => context.handleSubmit(
			() => onValid(context.getValue(_formFieldKey)), 
			(errors, error) => {
				return Object.keys(filterObjectByKey(errors, _formFieldKey)).length === 0 && (onInvalid ? onInvalid(filterObjectByKey(errors, _formFieldKey), error) : true);
			},
			// @ts-expect-error I want this to be able to only occur inside FormSplitter
			filterKeysError
		),
		watch: (key, method) => {
			context.watch(key !== 'submit' ? getKey(key) : key, method as WatchMethod<any>); 
		},
		field: (key, options) => context.field(getKey(key), options) as any,
		getErrors: (key, options) => context.getErrors(getKey(key), options),
		hasError: (key, options) => context.hasError(getKey(key), options),
		changeValue: (key, value, options) => {
			context.changeValue(getKey(key), value, {
				...options,
				filterKeysError
			}); 
		},
		getValue: (key) => context.getValue(getKey(key)),
		context: context.context,
		merge: (mergedForm) => {
			getterSetter.set(_formFieldKey, context.form, mergedForm);
			context.merge(mergedForm);
		},
		onChange: (key, fieldOptions) => (value) => {
			context.onChange(getKey(key), {
				...fieldOptions,
				filterKeysError
			})(value); 
		},
		reset: (newFrom, resetOptions) => {
			getterSetter.set(_formFieldKey, context.form, newFrom);
			return context.reset(newFrom, {
				...resetOptions,
				filterKeysError
			});
		},
		resetTouch: context.resetTouch,
		setError: context.setError,
		triggerChange: (
			cb,
			produceOptions
		) => {
			context.triggerChange(
				(form: T) => {
					return cb(
						getterSetter.get(_formFieldKey, form), 
						(targetValue) => {
							getterSetter.set(_formFieldKey, form, targetValue);
						}
					);
				}, 
				{
					...produceOptions,
					filterKeysError
				}
			);
		},
		updateController: (key) => {
			context.updateController(getKey(key)); 
		}
	};

	return result;
}
