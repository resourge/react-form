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

export const forEachPossibleKey = (key: string, onKey: (key: string) => void) => {
	const keyPoints = key.split('.');
		
	let currentKey = '';

	keyPoints.forEach((part) => {
		currentKey = currentKey ? `${currentKey}.` : currentKey;

		if (part.includes('[')) {
			const [arrayPart, index] = part.split(/[\\[\]]/);
			currentKey = `${currentKey}${arrayPart}`;
			onKey(currentKey);

			currentKey = `${currentKey}[${index}]`;
		}
		else {
			currentKey = `${currentKey}${part}`;
		}

		onKey(currentKey);
	});
};

export const getErrorsFromValidationErrors = (value: ValidationErrors[number]) => {
	return 'error' in value ? [value.error] : value.errors;
};

export const formatErrors = (
	errors: ValidationErrors = {} as ValidationErrors
) => {
	return errors
	.reduce<FormErrors>((val, value) => {
		const key = value.path;
		const errors = getErrorsFromValidationErrors(value);

		addErrorToFormErrors(val, key, errors);
		
		// Process nested paths to ensure all parent paths are included
		const parts = key.split('.');
		let currentPath = '';

		parts.forEach((part) => {
			currentPath = currentPath ? `${currentPath}.` : currentPath;

			if (part.includes('[')) {
				const [arrayPart, index] = part.split(/[\\[\]]/);
				currentPath = `${currentPath}${arrayPart}`;

				addErrorToFormErrors(val, currentPath, errors, true);

				currentPath = `${currentPath}[${index}]`;
			}
			else {
				currentPath = `${currentPath}${part}`;
			}

			if ( currentPath !== key ) {
				// Ensure the current path is added with an empty error structure
				addErrorToFormErrors(val, currentPath, errors, true);
			}
		});

		return val;
	}, {});
};
