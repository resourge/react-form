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

type UseErrorsConfig<T extends Record<string, any>> = {
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
};

export const useErrors = <T extends Record<string, any>>({
	validate, forceUpdate, 
	splitterOptionsRef, stateRef,
	validationType = 'onSubmit'
}: UseErrorsConfig<T>) => {
	const {
		shouldUpdateErrorsRef, changedKeysRef, touchesRef, 
		changeTouch, clearTouches, setSubmitTouches, 
		hasTouch, setTouch
	} = useTouches<T>({
		validationType,
		filterKeysError: splitterOptionsRef.current.filterKeysError
	});

	const errorRef = useRef<FormErrors<T>>({} as FormErrors<T>);
	const validationErrorsRef = useRef<ValidationErrors>([]);
	const changedKeys = Array.from(changedKeysRef.current);

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
			setTouch(path, true, validationType === 'onSubmit');
			
			changedKeysRef.current.add(path);
		});

		renderIfNewErrors([
			...validationErrorsRef.current,
			...newErrors
		]); 
	};

	const submitValidation = async () => {
		const errors = await validate(changedKeys);

		setSubmitTouches(
			stateRef.current,
			errors,
			validationErrorsRef.current
		);

		renderIfNewErrors(errors);

		return errors;
	};

	if ( shouldUpdateErrorsRef.current ) {
		const res = validate(changedKeys);

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
		const errors = errorRef.current[key as unknown as FormKey<T>];
		const touch = touchesRef.current.get(key);

		if (
			!errors 
			|| (validationType === 'onSubmit' && (!touch || touch.submitted === false) )
			|| (validationType === 'onTouch' && (!touch || touch.touch === false))
		) {
			return [];
		}

		return includeChildsIntoArray ? errors.childErrors : errors.errors;
	}

	return {
		errorRef,
		changedKeys,
		changedKeysRef,
		touchesRef,

		getErrors,
		submitValidation,
		updateTouches: changeTouch,
		clearTouches,
		setError,
		hasTouch,
		getTouch: setTouch
	};
};
