import { type MutableRefObject, useRef } from 'react';

import { type FormKey } from '../types/FormKey';
import { type ValidationErrors } from '../types/errorsTypes';
import { type FormErrors, type GetErrorsOptions, type SplitterOptions } from '../types/formTypes';
import { deepCompareValidationErrors } from '../utils/comparationUtils';
import { formatErrors } from '../utils/formatErrors';

export const useErrors = <T extends Record<string, any>>(
	{
		updateTouches, validate, touchesRef, 
		changedKeys, canValidate, forceUpdate, 
		splitterOptionsRef, firstSubmitRef
	}: {
		canValidate: boolean
		changedKeys: Array<FormKey<T>>
		firstSubmitRef: MutableRefObject<boolean>
		forceUpdate: () => void
		splitterOptionsRef: MutableRefObject<SplitterOptions & {
			preventStateUpdate?: boolean
		}>
		touchesRef: MutableRefObject<Record<string, object>>
		updateTouches: (key: FormKey<T> | string) => void
		validate: () => ValidationErrors | Promise<ValidationErrors>
	}
) => {
	const errorRef = useRef<FormErrors>({} as FormErrors);
	const validationErrorsRef = useRef<ValidationErrors>([]);
	const isValidatingFormRef = useRef(false);

	const setErrors = (errors: ValidationErrors, shouldUpdateTouches: boolean = false) => {
		if (
			!deepCompareValidationErrors(errors, validationErrorsRef.current)
		) {
			validationErrorsRef.current = errors;

			errorRef.current = formatErrors(errors);

			if ( shouldUpdateTouches ) {
				Object.keys(errorRef.current)
				.forEach((path) => {
					updateTouches(path);
				});
			}

			return true;
		}

		return false;
	};

	const updateErrors = (errors: ValidationErrors, shouldUpdateTouches: boolean = false) => { 
		const newErrors = splitterOptionsRef.current.filterKeysError
			? errors
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			.filter(({ path }) => splitterOptionsRef.current.filterKeysError!(path))
			: errors;

		if (
			setErrors(newErrors, shouldUpdateTouches)
		) { 
			forceUpdate();
			return true;
		}
		return false;
	};

	const validateForm = async () => {
		const errors = await Promise.resolve(validate());

		isValidatingFormRef.current = updateErrors(errors, true);

		return errors;
	};

	if ( changedKeys.length ) {
		const res = canValidate && !isValidatingFormRef.current 
			? validate() 
			: validationErrorsRef.current;

		isValidatingFormRef.current = false;

		if ( res instanceof Promise ) {
			isValidatingFormRef.current = true;
			res.then(updateErrors);
		}
		else {
			setErrors(res, firstSubmitRef.current);
		}
	}

	function getErrors<Model extends Record<string, any> = T>(
		key: FormKey<Model>, 
		{
			onlyOnTouch = true,
			includeChildsIntoArray = false
		}: GetErrorsOptions = {}
	): string[] {
		const errors = errorRef.current[key];

		if (
			!errors
			|| (
				onlyOnTouch 
				&& !touchesRef.current[key] 
			)
		) {
			return [];
		}

		return includeChildsIntoArray ? errors.childErrors : errors.errors;
	}

	return {
		errorRef,
		validationErrorsRef,
		getErrors,
		updateErrors,
		validateForm
	};
};
