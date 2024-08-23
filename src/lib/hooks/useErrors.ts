import { type MutableRefObject, useRef } from 'react';

import { type FormKey } from '../types/FormKey';
import {
	type FormErrors,
	type GetErrors,
	type GetErrorsOptions,
	type HasErrorOptions,
	type Touches
} from '../types/formTypes';
import { deepCompare } from '../utils/comparationUtils';

import { type CacheType } from './useTouches';

const checkIfCanCheckError = (
	key: string,
	touches: Touches<any>,
	onlyOnTouch?: boolean
) => {
	return !onlyOnTouch 
		|| ( onlyOnTouch && Boolean(touches[key]) );
};

export const useErrors = <T extends Record<string, any>>(
	{
		validate, touchesRef, changedKeys, canValidate, updateTouches, setCache, forceUpdate
	}: {
		canValidate: boolean
		changedKeys: Array<FormKey<T>>
		forceUpdate: () => void
		setCache: <ReturnValue extends CacheType>(key: string, type: string, cb: () => ReturnValue) => ReturnValue
		touchesRef: MutableRefObject<Touches<T>>
		updateTouches: (key: FormKey<T>) => void
		validate: () => FormErrors<T> | Promise<FormErrors<T>>
	}
) => {
	const errorRef = useRef<FormErrors<T>>({} as FormErrors<T>);
	const setErrors = (errors: FormErrors<T>, keys = Object.keys(errors)) => {
		Object.keys(errorRef.current)
		.filter((key) => !keys.includes(key))
		.forEach((key) => updateTouches(key));
		errorRef.current = errors;
	};
	const isValidatingFormRef = useRef(false);

	const updateErrors = (errors: FormErrors<T>) => { 
		const oldTouches = Object.keys(touchesRef.current);
		const newTouches = Object.keys(errors)
		.filter((key) => {
			updateTouches(key as FormKey<T>);
			return !oldTouches.includes(key);
		});

		if (
			newTouches.length > 0
			|| !deepCompare(errors, errorRef.current)
		) { 
			setErrors(errors);
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

	const hasError = (
		key: FormKey<T>, 
		options: HasErrorOptions = {}
	): boolean => {
		return setCache<boolean>(
			key, 
			'has',
			() => {
				const onlyOnTouch = options.onlyOnTouch ?? true;

				if ( checkIfCanCheckError(key, touchesRef.current, onlyOnTouch) ? Boolean(errorRef.current[key]) : false ) {
					return true;
				}
				else if ( !( options.strict ?? true ) ) {
					const regex = new RegExp(`^${key.replace('[', '\\[').replace(']', '\\]')}`, 'g');
	
					return Object.keys(errorRef.current)
					.some((errorKey) => {
						if ( checkIfCanCheckError(errorKey, touchesRef.current, onlyOnTouch) ) {
							return regex.test(errorKey);
						}
						return false;
					});
				}

				return false;
			}
		);
	};

	function getErrors<Model extends Record<string, any> = T>(
		key: FormKey<Model>, 
		options: GetErrorsOptions = {}
	): GetErrors {
		return setCache<GetErrors>(
			key, 
			'get',
			() => {
				const _strict = options.strict ?? true;
				const includeChildsIntoArray = options.includeChildsIntoArray ?? false;

				const getErrors = (key: FormKey<Model>): GetErrors => {
					if ( checkIfCanCheckError(key, touchesRef.current, ( options.onlyOnTouch ?? true )) ) {
						return [...errorRef.current[key] ?? []];
					}
					return [];
				};

				const newErrors = getErrors(key);

				if ( !( includeChildsIntoArray ? false : _strict ) ) {
					Object.keys(errorRef.current)
					.forEach((errorKey: string) => {
						if ( errorKey.includes(key) && errorKey !== key ) {
							newErrors.push(...getErrors(errorKey));
						}
					});
				}

				return newErrors;
			}
		);
	}

	return {
		errorRef,
		hasError,
		getErrors,
		updateErrors,
		validateForm
	};
};
