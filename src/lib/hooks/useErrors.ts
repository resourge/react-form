import { type MutableRefObject, useRef } from 'react';

import { type FormKey } from '../types/FormKey';
import {
	type GetErrorsOptions,
	type GetErrors,
	type HasErrorOptions,
	type Touches,
	type FormErrors,
	type FormOptions,
	type State
} from '../types/formTypes';

export type CacheType = string[] | FormErrors<any> | boolean;

const checkIfCanCheckError = <T extends Record<string, any>>(
	key: string,
	touches: Touches<any>,
	onlyOnTouch?: boolean,
	onlyOnTouchKeys: Array<FormKey<T>> = []
) => {
	return !onlyOnTouch 
		|| (
			(onlyOnTouch || onlyOnTouchKeys.length) && (
				Boolean(touches[key]) 
				|| onlyOnTouchKeys.some((onlyOnTouchKey: any) => Boolean(touches[onlyOnTouchKey]))
			)
		);
};

export const useErrors = <T extends Record<string, any>>(
	stateRef: MutableRefObject<State<T>>,
	formOptions?: FormOptions<T>
) => {
	const cacheErrors = useRef<Map<string, CacheType>>(new Map());

	const setCacheErrors = <ReturnValue extends CacheType>(key: string, cb: () => ReturnValue): ReturnValue => {
		if ( !cacheErrors.current.has(key) ) {
			cacheErrors.current.set(key, cb());
		}

		return cacheErrors.current.get(key) as ReturnValue;
	};

	const clearCacheErrors = () => {
		cacheErrors.current.clear();
	};

	const hasError = (
		key: FormKey<T>, 
		options?: HasErrorOptions<T>
	): boolean => {
		const strict = options?.strict ?? true;
		const onlyOnTouch = options?.onlyOnTouch ?? formOptions?.onlyOnTouchDefault ?? true;
		const onlyOnTouchKeys = options?.onlyOnTouchKeys ?? [];
		
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		const _key: string = `has_errors_${key}_${strict}_${onlyOnTouch}`;

		return setCacheErrors<boolean>(
			_key, 
			() => {
				const _errors: FormErrors<T> = stateRef.current.errors ?? {};

				let hasError = false;
				if ( checkIfCanCheckError(key, stateRef.current.touches, onlyOnTouch, onlyOnTouchKeys) ) {
					hasError = Boolean(_errors[key]);
				}

				if ( hasError ) {
					return true;
				}
				else if ( !strict ) {
					const regex = new RegExp(`^${key.replace('[', '\\[')
					.replace(']', '\\]')}`, 'g');
	
					return Object.keys(_errors)
					.some((errorKey) => {
						if ( checkIfCanCheckError(errorKey, stateRef.current.touches, onlyOnTouch) ) {
							return regex.test(errorKey);
						}
						return false;
					});
				}

				return hasError;
			}
		);
	};

	function getErrors<Model extends Record<string, any> = T>(
		key: FormKey<Model>, 
		options: GetErrorsOptions<T> = {
			strict: true,
			onlyOnTouch: formOptions?.onlyOnTouchDefault ?? true,
			includeKeyInChildErrors: true,
			includeChildsIntoArray: false,
			onlyOnTouchKeys: []
		}
	): GetErrors<Model> {
		const _strict = options?.strict ?? true;
		const onlyOnTouch = options?.onlyOnTouch ?? formOptions?.onlyOnTouchDefault ?? true;
		const onlyOnTouchKeys = options?.onlyOnTouchKeys ?? [];
		const includeKeyInChildErrors = options?.includeKeyInChildErrors ?? true;
		const includeChildsIntoArray = options?.includeChildsIntoArray ?? false;

		const strict = includeChildsIntoArray ? false : _strict;

		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		const _key: string = `get_errors_${key}_${strict}_${onlyOnTouch}_${includeKeyInChildErrors}_${includeChildsIntoArray}`;

		return setCacheErrors<GetErrors<Model>>(
			_key, 
			() => {
				const _errors: FormErrors<T> = stateRef.current.errors ?? {};
				const getErrors = (key: FormKey<Model>): GetErrors<Model> => {
					if ( checkIfCanCheckError(key, stateRef.current.touches, onlyOnTouch, onlyOnTouchKeys) ) {
						// @ts-expect-error // Working with array and object
						return [..._errors[key] ?? []];
					}
					// @ts-expect-error // Working with array and object
					return [];
				};

				const newErrors = getErrors(key);

				if ( !strict ) {
					const regex = new RegExp(`^${key.replace('[', '\\[')
					.replace(']', '\\]')}`, 'g');

					Object.keys(_errors)
					.forEach((errorKey: string) => {
						if ( errorKey.includes(key) && errorKey !== key ) {
							let newErrorKey = includeKeyInChildErrors === true ? errorKey : (
								errorKey.replace(regex, '') || key
							);

							// Remove first char if is a "."
							if ( newErrorKey[0] === '.' ) {
								newErrorKey = newErrorKey.substring(1, newErrorKey.length);
							}

							const _newErrors = getErrors(errorKey as FormKey<Model>);

							if ( includeChildsIntoArray ) {
								newErrors.push(..._newErrors);
							}
							
							newErrors[newErrorKey as any] = _newErrors as any;
						}
					});
				}

				return newErrors;
			}
		);
	}

	return {
		hasError,
		getErrors,
		clearCacheErrors
	};
};
