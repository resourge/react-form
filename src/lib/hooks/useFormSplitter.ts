/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { useControllerContext } from '../contexts/ControllerContext';
import { useFormContext } from '../contexts/FormContext';
import { type FormKey } from '../types/FormKey';
import { type PathValue } from '../types/PathValue';
import { type UseFormReturn, type WatchMethod } from '../types/formTypes';
import { IS_DEV } from '../utils/constants';

export type FormSplitterResult<
	O extends Record<string, any>,
	T extends Record<string, any>
> = UseFormReturn<T>
& {
	originalContext: UseFormReturn<O>['context']
}; 

export type FormSplitterResultFormKey<
	T extends Record<string, any>,
	K = FormKey<T>
> = FormSplitterResult<T, PathValue<T, K>>; 

/**
 * Hook to create a splitter form. Serves to create a form for the specific "formFieldKey"
 * * Note: useFormSplitter used inside a Controller doesn't need "formFieldKey" otherwise is mandatory
 * @param formFieldKey - key from `form` state 
 */
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(): FormSplitterResultFormKey<T, K>;
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(formFieldKey: K): FormSplitterResultFormKey<T, K>;
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(
	formFieldKey?: K
): FormSplitterResultFormKey<T, K> {
	const controllerContext = useControllerContext<any>();
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const context = controllerContext?.context ?? useFormContext<any>();
	const _formFieldKey = formFieldKey ?? (controllerContext?.name as K);

	if ( IS_DEV ) {
		if ( !_formFieldKey ) {
			throw new Error('\'formFieldKey\' undefined can only used inside a Controller component.');
		}
	}

	const getKey = (key: string): any => `${_formFieldKey}${key ? (key.startsWith('[') ? key : `.${key}`) : ''}` as FormKey<PathValue<T, K>>; ;

	const filterKeysError = (key: string) => key.includes(_formFieldKey) || _formFieldKey.includes(key);

	return {
		get form() {
			return context.getValue(_formFieldKey);
		},
		get errors() {
			return context.errors[_formFieldKey]?.childFormErrors ?? {};
		},
		get isTouched() {
			return context.hasTouch(_formFieldKey);
		},
		get isValid() {
			return !context.hasError(
				_formFieldKey, 
				{
					includeChildsIntoArray: true 
				}
			);
		},
		handleSubmit: (
			onValid,
			onInvalid,
			nextFilterKeysError?: (key: string) => boolean
		) => context.handleSubmit(
			() => onValid(context.getValue(_formFieldKey)),
			(errors) => {
				const newErrors = errors
				.filter(({ path }) => path.startsWith(_formFieldKey));

				return (
					onInvalid
						? onInvalid(newErrors)
						: newErrors
				);
			},
			// @ts-expect-error I want this to be able to only occur inside FormSplitter
			nextFilterKeysError ?? filterKeysError
		),
		watch: (key, method) => context.watch(key !== 'submit' ? getKey(key) : key, method as WatchMethod<any>),
		field: (key, options) => context.field(getKey(key), options) as any,
		getErrors: (key, options) => context.getErrors(getKey(key), options),
		hasError: (key, options) => context.hasError(getKey(key), options),
		changeValue: (key, value) => context.changeValue(getKey(key), value),
		getValue: (key) => context.getValue(getKey(key)),
		hasTouch: (key) => context.hasTouch(getKey(key)),
		reset: (newFrom, resetOptions) => context.reset({
			[_formFieldKey]: newFrom 
		}, resetOptions),
		resetTouch: context.resetTouch,
		setError: context.setError,
		triggerChange: (cb) => context.triggerChange((form: T) => cb(form[_formFieldKey])),
		updateController: (key) => context.updateController(getKey(key)),
		toJSON() {
			return {
				...this,
				get splitterContext() {
					return 'To Prevent circular dependency';
				},
				get context() {
					return 'To Prevent circular dependency';
				}
			};
		},
		originalContext: context.context,
		get context() {
			return this;
		}
	} as FormSplitterResultFormKey<T, K>;
}
