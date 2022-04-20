import { FormKey } from '../types/FormKey';
import { FormErrors } from '../types/types';

import { setDefaultOnError } from './setDefaultOnError';

/**
 * Default on errors for validation
 */
export const setFormYupValidation = () => {
	setDefaultOnError(<T extends Record<string, any>> (errors: any) => {
		if ( Array.isArray(errors) ) {
			return errors
			.reduce((obj: FormErrors<T>, error: any /* ValidationError */) => {
				error.inner
				.forEach((value: any /* ValidationError */) => {
					if ( !obj[value.path as FormKey<T>] ) {
						obj[value.path as FormKey<T>] = []
					}
					obj[value.path as FormKey<T>]?.push(...value.errors);
				}, {});
	
				return obj;
			}, {});
		}
		if ( errors && errors.inner ) {
			return errors.inner
			.reduce((obj: FormErrors<T>, value: any /* ValidationError */) => {
				if ( !obj[value.path as FormKey<T>] ) {
					obj[value.path as FormKey<T>] = []
				}
				obj[value.path as FormKey<T>]?.push(...value.errors);
	
				return obj;
			}, {});
		}
	
		return {}
	});
}
