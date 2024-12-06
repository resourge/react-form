import { type ValidationErrors } from '../types/errorsTypes';
import { type FormErrors } from '../types/formTypes';

function addErrorToFormErrors(
	formErrors: FormErrors, 
	path: string, 
	errors: string[],
	isChildError = false
) {
	formErrors[path] ??= {
		errors: [],
		childErrors: []
	};
	
	errors.forEach((message) => {
		if ( !isChildError ) {
			if ( !formErrors[path].errors.includes(message) ) {
				formErrors[path].errors.push(message);
			}
		}
		if ( !formErrors[path].childErrors.includes(message) ) {
			formErrors[path].childErrors.push(message);
		}
	});
}

export const formatErrors = (
	errors: ValidationErrors = {} as ValidationErrors 
) => {
	return errors
	.reduce<FormErrors>((val, value) => {
		const key = value.path;
		const error = 'error' in value ? [value.error] : value.errors;

		addErrorToFormErrors(val, key, error);
		
		// Process nested paths to ensure all parent paths are included
		const parts = key.split('.');
		let currentPath = '';

		parts.forEach((part) => {
			currentPath = currentPath ? `${currentPath}.` : currentPath;

			if (part.includes('[')) {
				const [arrayPart, index] = part.split(/[\\[\]]/);
				currentPath = `${currentPath}${arrayPart}`;

				addErrorToFormErrors(val, currentPath, error, true);

				currentPath = `${currentPath}[${index}]`;
			}
			else {
				currentPath = `${currentPath}${part}`;
			}

			if ( currentPath !== key ) {
				// Ensure the current path is added with an empty error structure
				addErrorToFormErrors(val, currentPath, error, true);
			}
		});

		return val;
	}, {});
};
