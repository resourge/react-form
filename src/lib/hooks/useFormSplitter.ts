import invariant from 'tiny-invariant'

import { useControllerContext } from '../contexts/ControllerContext';
import { type FormContextObject, useFormContext } from '../contexts/FormContext'
import { type FormKey } from '../types/FormKey';
import { type PathValue } from '../types/PathValue';
import { type ProduceNewStateOptions, type UseFormReturn } from '../types/types'
import { filterObjectByKey } from '../utils/utils';

import { useGetterSetter } from './useGetterSetter';
import { type WatchMethod } from './useWatch';

/**
 * Hook to create a splitter form. Serves to create a form for the specific "formFieldKey"
 * * Note: useFormSplitter used inside a Controller doesn't need "formFieldKey" otherwise is mandatory
 * @param formFieldKey - key from `form` state 
 */
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(): Omit<UseFormReturn<PathValue<T, K>>, 'context' | 'triggerChange'> & Pick<UseFormReturn<T>, 'context'> & {
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
}
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(formFieldKey: K): Omit<UseFormReturn<PathValue<T, K>>, 'context' | 'triggerChange'> & Pick<UseFormReturn<T>, 'context'> & {
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
}
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(
	formFieldKey?: K
): Omit<UseFormReturn<PathValue<T, K>>, 'context' | 'triggerChange'> & Pick<UseFormReturn<T>, 'context'> & {
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
	} {
	const controllerContext = useControllerContext<any>();
	let context: FormContextObject<any>;
	let _formFieldKey = formFieldKey as K;
	if ( controllerContext ) {
		context = controllerContext.context;
		_formFieldKey = formFieldKey ?? controllerContext.name as K;
	}
	else {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		context = useFormContext<any>();
	}

	if ( __DEV__ ) {
		invariant(_formFieldKey, '\'formFieldKey\' undefined can only used inside a Controller component.');
	}

	const getKey = (key: FormKey<PathValue<T, K>>): any => {
		return `${_formFieldKey}${key ? ((key as string).includes('[') ? key : `.${key as string}`) : ''}` as FormKey<PathValue<T, K>>;
	}

	const filterKeysError = (key: string) => key.includes(_formFieldKey) || _formFieldKey.includes(key)

	const getterSetter = useGetterSetter();

	return {
		get form() {
			return context.getValue(_formFieldKey)
		},
		get errors() {
			return filterObjectByKey(context.errors, _formFieldKey)
		},
		get touches() {
			return filterObjectByKey(context.touches, _formFieldKey)
		},
		get isTouched() {
			return Object.keys(this.touches).length > 0
		},
		get isValid() {
			return Object.keys(this.errors).length === 0;
		},
		handleSubmit: (
			(
				onValid, 
				onInvalid
			) => context.handleSubmit(
				() => onValid(context.getValue(_formFieldKey)), 
				(errors, error) => {
					return Object.keys(filterObjectByKey(errors, _formFieldKey)).length === 0 && (onInvalid ? onInvalid(filterObjectByKey(errors, _formFieldKey), error) : true)
				},
				// @ts-expect-error I want this to be able to only occur inside FormSplitter
				filterKeysError
			)
		) as UseFormReturn<PathValue<T, K>>['handleSubmit'],
		watch: ((key, method) => {
			context.watch(key !== 'submit' ? getKey(key) : key, method as WatchMethod<any>); 
		}) as UseFormReturn<PathValue<T, K>>['watch'],
		field: ((key, options) => context.field(getKey(key), options)) as UseFormReturn<PathValue<T, K>>['field'],
		getErrors: ((key, options) => {
			console.log('key', key)
			console.log('key', getKey(key))
			return context.getErrors(getKey(key), options)
		}) as UseFormReturn<PathValue<T, K>>['getErrors'],
		hasError: ((key, options) => context.hasError(getKey(key), options)) as UseFormReturn<PathValue<T, K>>['hasError'],
		changeValue: ((key, value, options) => {
			console.log('getKey(key)', getKey(key), value)
			context.changeValue(getKey(key), value, {
				...options,
				filterKeysError
			}); 
		}) as UseFormReturn<PathValue<T, K>>['changeValue'],
		getValue: ((key) => context.getValue(getKey(key))) as UseFormReturn<PathValue<T, K>>['getValue'],
		context: context.context,
		merge: (mergedForm) => {
			getterSetter.set(_formFieldKey, context.form, mergedForm)
			context.merge(mergedForm);
		},
		onChange: ((key, fieldOptions) => (value) => {
			context.onChange(getKey(key), {
				...fieldOptions,
				filterKeysError
			})(value); 
		}) as UseFormReturn<PathValue<T, K>>['onChange'],
		reset: (newFrom, resetOptions) => {
			getterSetter.set(_formFieldKey, context.form, newFrom)
			return context.reset(newFrom, {
				...resetOptions,
				filterKeysError
			})
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
							getterSetter.set(_formFieldKey, form, targetValue)
						}
					)
				}, 
				{
					...produceOptions,
					filterKeysError
				}
			);
		},
		updateController: ((key) => {
			context.updateController(getKey(key)); 
		}) as UseFormReturn<PathValue<T, K>>['updateController']
	}
}
