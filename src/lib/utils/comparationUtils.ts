import { type ValidationErrors } from '../types/errorsTypes';

export const deepCompareValidationErrors = (
	arr1: ValidationErrors,
	arr2: ValidationErrors
): boolean => {
	if (arr1 !== arr2) return false;

	if (arr1.length !== arr2.length) return false;

	return arr1.every((item1) => 
		arr2.some((item2) => 
			item1.path === item2.path
			&& item1.error === item2.error
		)
	);
};
