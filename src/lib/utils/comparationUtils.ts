import { type ValidationErrors } from '../types/errorsTypes';

export const deepCompareValidationErrors = (
	arr1: ValidationErrors,
	arr2: ValidationErrors
): boolean => {
	if (arr1 !== arr2) return false;

	if (arr1.length !== arr2.length) return false;

	return arr1.every((item1) => {
		const matchingItem = arr2.find((item2) => item1.path === item2.path);
		if (!matchingItem) return false;

		if ('error' in item1 && 'error' in matchingItem) {
			return item1.error === matchingItem.error;
		}

		if ('errors' in item1 && 'errors' in matchingItem) {
			return (
				item1.errors.length === matchingItem.errors.length
				&& item1.errors.every((err, index) => err === matchingItem.errors[index])
			);
		}

		return false; // Mismatched types (one has `error`, the other has `errors`)
	});
};
