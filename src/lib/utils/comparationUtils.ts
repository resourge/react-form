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

export function deepCompare(
	obj1?: any,
	obj2?: any
): boolean {
	if (obj1 === obj2) {
		return true;
	}

	if ( obj1 instanceof Date && obj2 instanceof Date ) {
		return obj1.getTime() === obj2.getTime();
	}

	if ( !obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object' ) {
		// Handles cases where one is an object and the other is not, or one of them is null
		return false;
	}

	// Handle arrays comparison
	if (Array.isArray(obj1) && Array.isArray(obj2)) {
		if ( obj1.length !== obj2.length ) {
			return false;
		}
		return obj1.length === obj2.length 
			&& obj1.every((item, i) => deepCompare(item, obj2[i]));
	}

	// Get the keys of each object
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	const keys1 = Object.keys(obj1);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	const keys2 = Object.keys(obj2);

	// Check if both objects have the same number of keys
	if (keys1.length !== keys2.length) return false;

	return keys1.every((key) => keys2.includes(key) && deepCompare(obj1[key], obj2[key]));
}
