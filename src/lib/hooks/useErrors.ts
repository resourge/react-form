import { type MutableRefObject, useRef } from 'react';

import { type FormKey } from '../types/FormKey';
import {
	type SplitterOptions,
	type FormErrors,
	type GetErrors,
	type GetErrorsOptions
} from '../types/formTypes';
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
		updateTouches: (keys: FormKey<T>) => void
		validate: () => FormErrors<T> | Promise<FormErrors<T>>
	}
) => {
	const errorRef = useRef<FormErrors<T>>({} as FormErrors<T>);
	const cacheErrors = useRef<WeakMap<object, GetErrors>>(new WeakMap());
	const isValidatingFormRef = useRef(false);

	const setErrors = (errors: FormErrors<T>) => {
		const keys = Object.keys(errors);
		
		Object.keys(
			filterObject(
				errorRef.current, 
				splitterOptionsRef.current.filterKeysError
			)
		)
		.filter((key) => !keys.includes(key))
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
			newTouches.length > 0
			|| !deepCompare(newErrors, errorRef.current)
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
			res.then((err) => updateErrors(err));
		}
		else {
			setErrors(res);
		}
	}

	function getErrors<Model extends Record<string, any> = T>(
		key: FormKey<Model>, 
		options: GetErrorsOptions = {}
	): GetErrors {
		if ( touchesRef.current[key] === undefined ) {
			if ( options.onlyOnTouch ?? true ) {
				return [];
			}
			touchesRef.current[key] = {};
		}
		let newErrors = cacheErrors.current.get(touchesRef.current[key]);
		if ( !newErrors ) {
			const {
				strict = true,
				includeChildsIntoArray = false
			} = options;

			newErrors = errorRef.current[key] ?? [];

			if ( !( includeChildsIntoArray ? false : strict ) ) {
				Object.keys(errorRef.current)
				.forEach((errorKey) => {
					if ( errorKey.includes(key) && errorKey !== key ) {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						newErrors!.push(...(errorRef.current[errorKey] ?? []));
					}
				});
			}

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
