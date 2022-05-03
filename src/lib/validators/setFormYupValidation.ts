
import { setDefaultOnError } from './setDefaultOnError';

/**
 * Default on errors for validation
 */
export const setFormYupValidation = () => {
	setDefaultOnError((errors: any) => {
		if ( Array.isArray(errors) ) {
			return errors
			.flatMap((error) => error.inner);
		}
		if ( errors && errors.inner ) {
			return errors.inner
		}
	
		return {}
	});
}
