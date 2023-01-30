import { useControllerContext } from '../contexts/ControllerContext';
import { FormContextObject, useFormContext } from '../contexts/FormContext'
import { FormKey } from '../types/FormKey';
import { FormErrors, Touches, UseFormReturn } from '../types/types'
import { filterObjectByKey } from '../utils/utils';

import { WatchMethod } from './useWatch';

/**
 * Hook to create a splitter form. Serves to create a form for the specific "formFieldKey"
 * 
 * @param formFieldKey - key from `form` state 
 */
export const useFormSplitter = <
	T extends Record<string, any>,
	K extends FormKey<T>
>(
	formFieldKey: FormKey<T>
): Omit<UseFormReturn<T[K]>, 'context'> & Pick<UseFormReturn<T>, 'context'> => {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const context = useControllerContext<any>() ?? useFormContext<any>();

	const getKey = (key: FormKey<T[K]>): any => {
		return `${formFieldKey}${key ? `.${key as string}` : ''}` as FormKey<T[K]>;
	}

	return {
		get form() {
			return context.getValue(formFieldKey)
		},
		get errors() {
			return filterObjectByKey(context.errors, formFieldKey)
		},
		get touches() {
			return filterObjectByKey(context.touches, formFieldKey)
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
			) => async (e) => {
				const originalErrors = context.errors;
				const originalTouches = context.touches;
				try {
					return await context.handleSubmit(
						() => onValid(context.getValue(formFieldKey)), 
						(errors, error) => {
							return Object.keys(filterObjectByKey(errors, formFieldKey)).length === 0 && (onInvalid ? onInvalid(filterObjectByKey(errors, formFieldKey), error) : true)
						}
					)(e);
				}
				finally {
					(context as FormContextObject<any> & { _fieldFormReset: (
						originalErrors: FormErrors<T>,
						originalTouches: Touches<T>,
						ignoreKeys: FormKey<T>
					) => void })._fieldFormReset(originalErrors, originalTouches, formFieldKey);
				}
			}
		) as UseFormReturn<T[K]>['handleSubmit'],
		watch: ((key, method) => context.watch(key !== 'submit' ? getKey(key) : key, method as WatchMethod<any>)) as UseFormReturn<T[K]>['watch'],
		field: ((key, options) => context.field(getKey(key), options)) as UseFormReturn<T[K]>['field'],
		getErrors: ((key, options) => context.getErrors(getKey(key), options)) as UseFormReturn<T[K]>['getErrors'],
		hasError: ((key, options) => context.hasError(getKey(key), options)) as UseFormReturn<T[K]>['hasError'],
		changeValue: ((key, value, options) => context.changeValue(getKey(key), value, options)) as UseFormReturn<T[K]>['changeValue'],
		getValue: ((key) => context.getValue(getKey(key))) as UseFormReturn<T[K]>['getValue'],
		context: context.context,
		merge: context.merge,
		onChange: context.onChange,
		reset: context.reset,
		resetTouch: context.resetTouch,
		setError: context.setError,
		triggerChange: context.triggerChange,
		updateController: context.updateController
	}
}
