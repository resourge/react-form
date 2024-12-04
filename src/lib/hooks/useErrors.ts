import { type MutableRefObject, useRef } from 'react';

import { type FormKey } from '../types/FormKey';
import { type SplitterOptions, type FormErrors, type GetErrorsOptions } from '../types/formTypes';
import { deepCompare } from '../utils/comparationUtils';
import { filterObject } from '../utils/utils';

export const useErrors = <T extends Record<string, any>>(
	{
		validate, touchesRef, changedKeys, canValidate, updateTouches, forceUpdate, splitterOptionsRef
	}: {
		canValidate: boolean
		changedKeys: Array<FormKey<T>>
		forceUpdate: () => void
		splitterOptionsRef: React.MutableRefObject<SplitterOptions & {
			preventStateUpdate?: boolean
		}>
		touchesRef: MutableRefObject<Record<string, object>>
		updateTouches: (keys: FormKey<T> | string) => void
		validate: () => FormErrors<T> | Promise<FormErrors<T>>
	}
) => {
	const errorRef = useRef<FormErrors<T>>({} as FormErrors<T>);
	const cacheErrors = useRef<WeakMap<object, string[]>>(new WeakMap());
	const isValidatingFormRef = useRef(false);

	const setErrors = (errors: FormErrors<T>) => {
		const errorKeys = Object.keys(errors);
		
		// Clear old errors for keys that no longer have errors
		Object.keys(
			filterObject(
				errorRef.current, 
				splitterOptionsRef.current.filterKeysError
			)
		)
		.filter((key) => !errorKeys.includes(key))
		.forEach(updateTouches);

		errorRef.current = errors;
	};

	const updateErrors = (errors: FormErrors<T>) => { 
		const newErrors = filterObject(errors, splitterOptionsRef.current.filterKeysError);
		
		const oldTouches = Object.keys(touchesRef.current);

		const newTouches = Object.keys(newErrors)
		.filter((key) => {
			updateTouches(key as FormKey<T>);
			return !oldTouches.includes(key);
		});

		if (
			newTouches.length || !deepCompare(newErrors, errorRef.current)
		) { 
			setErrors(newErrors);
			forceUpdate();
			return true;
		}
		return false;
	};

	const validateForm = async () => {
		const errors = await Promise.resolve(validate());

		isValidatingFormRef.current = updateErrors(errors);

		return errors;
	};

	if ( changedKeys.length ) {
		const res = canValidate && !isValidatingFormRef.current ? validate() : errorRef.current;

		isValidatingFormRef.current = false;

		if ( res instanceof Promise ) {
			isValidatingFormRef.current = true;
			res.then(updateErrors);
		}
		else {
			setErrors(res);
		}
	}

	function getErrors<Model extends Record<string, any> = T>(
		key: FormKey<Model>, 
		{
			onlyOnTouch = true,
			includeChildsIntoArray = false
		}: GetErrorsOptions = {}
	): string[] {
		const keys = includeChildsIntoArray
			? Object.keys(touchesRef.current)
			.filter((touchKey) => touchKey !== key && touchKey.startsWith(key))
			: [];

		keys.push(key);

		let newErrors = keys
		.flatMap((touchKey) => {
			touchesRef.current[touchKey] ??= {};
			return cacheErrors.current.get(touchesRef.current[touchKey]);
		})
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		.filter(Boolean) as string[];

		if ( onlyOnTouch && newErrors.length === 0 ) {
			return [];
		}

		if ( !newErrors.length ) {
			newErrors = (
				includeChildsIntoArray 
					? Object.keys(errorRef.current)
					.filter((errorKey) => errorKey === key || errorKey.startsWith(key))
					.flatMap((errorKey) => errorRef.current[errorKey as FormKey<T>] ?? [])
					: (errorRef.current[key] ?? [])
			);

			cacheErrors.current.set(touchesRef.current[key], newErrors);
		}

		return newErrors;
	}

	return {
		errorRef,
		getErrors,
		updateErrors,
		validateForm
	};
};
