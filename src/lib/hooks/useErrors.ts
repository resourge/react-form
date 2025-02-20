import { type MutableRefObject, useRef } from 'react';

import { type FormKey } from '../types/FormKey';
import { type ValidationErrors } from '../types/errorsTypes';
import {
	type FormErrors,
	type FormValidationType,
	type GetErrorsOptions,
	type SplitterOptions,
	type Touches
} from '../types/formTypes';
import { deepCompareValidationErrors } from '../utils/comparationUtils';
import { formatErrors, getErrorsFromValidationErrors } from '../utils/formatErrors';

import { useTouches } from './useTouches';

type UseErrorsConfig<T extends Record<string, any>> = {
	forceUpdate: () => void
	splitterOptionsRef: MutableRefObject<SplitterOptions & {
		preventStateUpdate?: boolean
	}>
	stateRef: React.MutableRefObject<T>
	touchesRef: React.MutableRefObject<Touches>
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
	validationType = 'onSubmit', 
	touchesRef
}: UseErrorsConfig<T>) => {
	const {
		shouldUpdateErrorsRef, changedKeysRef, 
		changeTouch, clearTouches, 
		hasTouch, setTouch, getTouch
	} = useTouches<T>({
		validationType,
		touchesRef,
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
			setTouch(path, stateRef.current[path], true, validationType === 'onSubmit');
			
			changedKeysRef.current.add(path);
		});

		renderIfNewErrors([
			...validationErrorsRef.current,
			...newErrors
		]); 
	};

	const submitValidation = async () => {
		let newErrors = await validate(changedKeys);

		if (splitterOptionsRef.current.filterKeysError ) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			newErrors = newErrors.filter(({ path }) => splitterOptionsRef.current.filterKeysError!(path));
		}
		
		touchesRef.current
		.forEach((_, key) => {
			if (!splitterOptionsRef.current.filterKeysError || splitterOptionsRef.current.filterKeysError(key as FormKey<T>)) {
				setTouch(key as FormKey<T>, true, true);
			}
		});

		newErrors
		.forEach((val) => {
			const errors = getErrorsFromValidationErrors(val);
			if ( 
				!changedKeysRef.current.has(val.path as FormKey<T>) 
				|| !(
					validationErrorsRef.current.some((prevVal) => {
						const prevErrors = getErrorsFromValidationErrors(prevVal);

						return prevVal.path === val.path
							&& errors.errors.length === prevErrors.errors.length
							&& errors.errors.some((error) => prevErrors.errors.includes(error));
					})
				)
			) {
				changedKeysRef.current.add(val.path as FormKey<T>);
			}
		});

		renderIfNewErrors(newErrors);

		return (errorRef.current['' as FormKey<T>]?.childFormErrors ?? {}) as unknown as FormErrors<T>;
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
		const touch = getTouch(key);

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

		getErrors,
		submitValidation,
		changeTouch,
		clearTouches,
		setError,
		hasTouch
	};
};
