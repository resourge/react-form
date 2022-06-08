import { useRef } from 'react';

import { FormKey } from '../types/FormKey';
import { 
	GetErrorsOptions, GetErrors, HasErrorOptions, Touches,
	FormErrors
} from '../types/types';

export type CacheType = string[] | FormErrors<any> | boolean

const checkIfCanCheckError = (
	key: string,
	touches: Touches<any>,
	onlyOnTouch?: boolean
) => {
	return !onlyOnTouch || (onlyOnTouch && touches[key])
}

export const useErrors = <T extends Record<string, any>>(
	errors: FormErrors<T>,
	touches: Touches<T>
) => {
	const cacheErrors = useRef<{ [key: string]: CacheType }>({});

	const setCacheErrors = <ReturnValue extends CacheType>(key: string, cb: () => ReturnValue): ReturnValue => {
		if ( !cacheErrors.current[key] ) {
			cacheErrors.current[key] = cb();
		}

		return cacheErrors.current[key] as ReturnValue
	}

	const clearCacheErrors = () => {
		cacheErrors.current = {}
	}

	const hasError = (
		key: FormKey<T>, 
		options: HasErrorOptions = {
			strict: true,
			onlyOnTouch: false
		}
	): boolean => {
		const {
			strict = true,
			onlyOnTouch = false
		} = options;
		
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		const _key: string = `has_errors_${key}_${strict}_${onlyOnTouch}`;

		return setCacheErrors<boolean>(
			_key, 
			() => {
				const _errors: FormErrors<T> = errors ?? {};

				let hasError = false;
				if ( checkIfCanCheckError(key, touches, onlyOnTouch) ) {
					hasError = Boolean(_errors[key]);
				}

				if ( hasError ) {
					return true;
				}
				else {
					if ( !strict ) {
						const regex = new RegExp(`^${key.replace('[', '\\[').replace(']', '\\]')}`, 'g')
	
						return Object.keys(_errors)
						.some((errorKey) => {
							if ( checkIfCanCheckError(errorKey, touches, onlyOnTouch) ) {
								return regex.test(errorKey)
							}
							return false;
						})
					}
				}

				return hasError;
			}
		)
	}

	function getErrors<Model extends Record<string, any> = T>(
		key: FormKey<Model>, 
		options: GetErrorsOptions = {
			strict: true,
			onlyOnTouch: false,
			includeKeyInChildErrors: true,
			includeChildsIntoArray: false
		}
	): GetErrors<Model> {
		const {
			strict: _strict = true,
			onlyOnTouch = false,
			includeKeyInChildErrors = true,
			includeChildsIntoArray = false
		} = options;

		const strict = includeChildsIntoArray ? false : _strict;

		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		const _key: string = `get_errors_${key}_${strict}_${onlyOnTouch}_${includeKeyInChildErrors}_${includeChildsIntoArray}`;

		return setCacheErrors<GetErrors<Model>>(
			_key, 
			() => {
				const _errors: FormErrors<T> = errors ?? {};
				const getErrors = (key: FormKey<Model>): GetErrors<Model> => {
					if ( checkIfCanCheckError(key, touches, onlyOnTouch) ) {
						// @ts-expect-error // Working with array and object
						return [..._errors[key] ?? []];
					}
					// @ts-expect-error // Working with array and object
					return []
				}

				const newErrors = getErrors(key);

				if ( !strict ) {
					const regex = new RegExp(`^${key.replace('[', '\\[').replace(']', '\\]')}`, 'g')

					Object.keys(_errors)
					.forEach((errorKey: string) => {
						if ( errorKey.includes(key) && errorKey !== key ) {
							let newErrorKey = includeKeyInChildErrors === true ? errorKey : (
								errorKey.replace(regex, '') || key
							)

							// Remove first char if is a "."
							if ( newErrorKey[0] === '.' ) {
								newErrorKey = newErrorKey.substring(1, newErrorKey.length)
							}

							const _newErrors = getErrors(errorKey as FormKey<Model>);

							if ( includeChildsIntoArray ) {
								newErrors.push(..._newErrors);
							}
							
							newErrors[newErrorKey as keyof GetErrors<Model>] = _newErrors as any;
						}
					});
				}

				return newErrors;
			}
		)
	}

	return {
		hasError,
		getErrors,
		clearCacheErrors
	}
}
