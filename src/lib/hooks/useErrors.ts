import { type MutableRefObject, useRef } from 'react';

import { type FormKey } from '../types/FormKey';
import { type ValidationErrors } from '../types/errorsTypes';
import {
	type FormErrors,
	type FormValidationType,
	type GetErrorsOptions,
	type SplitterOptions
} from '../types/formTypes';
import { deepCompareValidationErrors } from '../utils/comparationUtils';
import { formatErrors } from '../utils/formatErrors';

import { useTouches } from './useTouches';

export const useErrors = <T extends Record<string, any>>(
	{
		validate, forceUpdate, 
		splitterOptionsRef, stateRef,
		validationType = 'onSubmit'
	}: {
		forceUpdate: () => void
		splitterOptionsRef: MutableRefObject<SplitterOptions & {
			preventStateUpdate?: boolean
		}>
		stateRef: React.MutableRefObject<T>
		validate: (changedKeys: Array<FormKey<T>>) => ValidationErrors | Promise<ValidationErrors>
		/**
		 * Validation type, specifies the type of validation.
		 * @default 'onSubmit'
		 */
		validationType?: FormValidationType
	}
) => {
	const {
		shouldUpdateErrorsRef, changedKeysRef, touchesRef, submitTouchesRef, 
		updateTouches, clearTouches, setSubmitTouches
	} = useTouches<T>({
		validationType,
		filterKeysError: splitterOptionsRef.current.filterKeysError
	});

	const errorRef = useRef<FormErrors>({} as FormErrors);
	const validationErrorsRef = useRef<ValidationErrors>([]);

	const setErrors = (errors: ValidationErrors) => {
		if (
			!deepCompareValidationErrors(errors, validationErrorsRef.current)
		) {
			validationErrorsRef.current = errors;

			errorRef.current = formatErrors(errors);

			return true;
		}

		return false;
	};

	const renderIfNewErrors = (errors: ValidationErrors) => {
		if ( setErrors(errors) ) {
			forceUpdate();
		}
	};

	const setError = (
		newErrors: Array<{
			errors: string[]
			path: FormKey<T>
		}>
	) => {
		newErrors.forEach(({ path }) => {
			if ( validationType === 'onSubmit' ) {
				submitTouchesRef.current.add(path);
			}
			updateTouches(path, false);
		});

		renderIfNewErrors([
			...validationErrorsRef.current,
			...newErrors
		]); 
	};

	const submitValidation = async () => {
		const errors = await validate(Array.from(changedKeysRef.current));

		setSubmitTouches(
			stateRef.current,
			errors,
			validationErrorsRef.current
		);

		renderIfNewErrors(errors);

		return errors;
	};

	if ( shouldUpdateErrorsRef.current ) {
		const res = validate(Array.from(changedKeysRef.current));

		if ( res instanceof Promise ) {
			res.then(renderIfNewErrors);
		}
		else {
			setErrors(res);
		}
	}

	function getErrors<Model extends Record<string, any> = T>(
		key: FormKey<Model>, 
		{ includeChildsIntoArray = false }: GetErrorsOptions = {}
	): string[] {
		const errors = errorRef.current[key];

		if ( 
			!errors
			|| (
				validationType === 'onSubmit' && !submitTouchesRef.current.has(key)
			) || (
				validationType === 'onTouch' && !touchesRef.current[key]
			)
		) {
			return [];
		}

		return includeChildsIntoArray ? errors.childErrors : errors.errors;
	}

	return {
		errorRef,
		changedKeysRef,
		touchesRef,

		getErrors,
		submitValidation,
		updateTouches,
		clearTouches,
		setError
	};
};
