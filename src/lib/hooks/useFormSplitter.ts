/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useControllerContext } from '../contexts/ControllerContext';
import { useFormContext } from '../contexts/FormContext';
import { useBaseFormSplitterContext } from '../contexts/FormSplitterContext';
import { type FormKey } from '../types/FormKey';
import { type PathValue } from '../types/PathValue';
import { type UseFormSplitterResult } from '../types/formTypes';
import { IS_DEV } from '../utils/constants';
import { TARGET_VALUE } from '../utils/observeObject/observeObject';

import { useProxy } from './useProxy';

type UseFormSplitterResultByKey<
	T extends Record<string, any>,
	K extends FormKey<T>
> = UseFormSplitterResult<PathValue<T, K>>;

/**
 * Hook to create a splitter form. Serves to create a form for the specific "formFieldKey"
 * * Note: useFormSplitter used inside a Controller doesn't need "formFieldKey" otherwise is mandatory
 * @param formFieldKey - key from `form` state 
 */
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(): UseFormSplitterResultByKey<T, K>;
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(formFieldKey: K): UseFormSplitterResultByKey<T, K>;
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(formFieldKey?: K): UseFormSplitterResultByKey<T, K> {
	const controllerContext = useControllerContext<any>();
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const context = controllerContext?.context ?? useBaseFormSplitterContext<PathValue<T, K>>() ?? useFormContext<PathValue<T, K>>();
	const _formFieldKey = formFieldKey ?? (controllerContext?.name as K);

	if ( IS_DEV ) {
		if ( !_formFieldKey ) {
			throw new Error('\'formFieldKey\' undefined can only used inside a Controller component.');
		}
	}

	const getKey = (key: string): any => `${_formFieldKey}${key ? (key.startsWith('[') ? key : `.${key}`) : ''}` as FormKey<PathValue<T, K>>; ;

	const filterKeysError = (key: string) => key.includes(_formFieldKey) || _formFieldKey.includes(key);
	const hasTouch = (key: string) => context.hasTouch(getKey(key));
	const updateController = (key: string) => context.updateController(getKey(key));

	const {
		form, changeValue, getValue, field, reset, onKeyTouch
	} = useProxy<PathValue<T, K>>({
		// @ts-expect-error I KNOW
		touchesRef: context._options.touchesRef,
		// @ts-expect-error I KNOW
		onKeyTouch: (key, metadata) => context._options.onKeyTouch(getKey(key), metadata),

		defaultValue: () => context.getValue(_formFieldKey)[TARGET_VALUE], 
		hasTouch
	});

	return {
		form,
		get errors() {
			return context.errors[_formFieldKey]?.formErrors ?? {};
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
		field,
		getErrors: (key, options) => context.getErrors(getKey(key), options) as any,
		hasError: (key, options) => context.hasError(getKey(key), options),
		changeValue,
		getValue,
		hasTouch,
		reset,
		resetTouch: context.resetTouch,
		setError: context.setError,
		updateController,
		// @ts-expect-error It's to prevent circular dependency
		toJSON: context.toJSON,
		get context() {
			return this;
		},
		type: 'formSplitter',
		_options: {
			// @ts-expect-error I KNOW
			touchesRef: context._options.touchesRef,
			onKeyTouch
		}
	};
}
