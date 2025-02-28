import { useRef } from 'react';

import { type FormKey } from '../types/FormKey';
import { type ValidationErrors } from '../types/errorsTypes';
import {
	type FormErrors,
	type FormValidationType,
	type GetErrorsOptions,
	type Touches,
	type ValidateSubmissionErrors
} from '../types/formTypes';
import { deepCompareValidationErrors } from '../utils/comparationUtils';
import { formatErrors } from '../utils/formatErrors';
import { setSubmitDeepKeys } from '../utils/utils';

import { useTouches } from './useTouches';

type UseErrorsConfig<T extends Record<string, any>> = {
	forceUpdate: () => void
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
	stateRef, touchesRef,
	validationType = 'onSubmit'
}: UseErrorsConfig<T>) => {
	const {
		shouldUpdateErrorsRef, changedKeysRef, 
		changeTouch, clearTouches, 
		hasTouch, setTouch, getTouch
	} = useTouches<T>({
		validationType,
		touchesRef
	});

	const errorRef = useRef<FormErrors<T>>({} as FormErrors<T>);
	const validationErrorsRef = useRef<ValidationErrors>([]);
	const changedKeys = Array.from(changedKeysRef.current);

	const setErrors = (errors: ValidationErrors) => {
		// To only allow errors in areas 
		// where the camps have being touched our previously had error
		const newErrors = validationType !== 'always'
			? errors
			.filter(({ path }) => {
				const touch = getTouch(path as FormKey<T>);

				return (
					touch
					&& (
						(validationType === 'onSubmit' && touch.submitted)
						|| (validationType === 'onTouch' && touch.touch)
					)
				);
			})
			: errors;
		
		if (
			!deepCompareValidationErrors(newErrors, validationErrorsRef.current)
		) {
			validationErrorsRef.current = newErrors;
			errorRef.current = formatErrors(newErrors);

			return true;
		}

		return false;
	};

	const renderNewErrors = (errors: ValidationErrors) => {
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
			setTouch(
				path, 
				stateRef.current[path], 
				true, 
				validationType === 'onSubmit'
			);

			changedKeysRef.current.add(path);
		});

		const _newErrors = [
			...validationErrorsRef.current
		];

		newErrors.forEach(({ path, errors }) => {
			errors.forEach((error) => {
				_newErrors.push({
					path,
					error
				});
			});
		});

		renderNewErrors(_newErrors); 
	};

	const validateSubmission = async (
		validateErrors?: ValidateSubmissionErrors,
		filterKeysError?: (key: string) => boolean
	) => {
		let newErrors = await validate(changedKeys);

		if ( validateErrors ) {
			const result = await validateErrors(newErrors);

			if ( typeof result === 'boolean' ) {
				if ( !result ) {
					// eslint-disable-next-line @typescript-eslint/only-throw-error
					throw newErrors;
				}
			}
			else {
				newErrors = result;
			}
		}

		switch ( validationType ) {
			case 'onSubmit':
				setSubmitDeepKeys(
					stateRef.current, 
					touchesRef.current,
					filterKeysError
				);
				break;
			case 'onTouch':
				touchesRef.current
				.forEach((_, key) => {
					if (!filterKeysError || filterKeysError(key as FormKey<T>)) {
						setTouch(key as FormKey<T>, true, true);
					}
				});
				break;
		}

		// filterKeysError is not need because handleSubmit already filters
		newErrors
		.forEach((val) => {
			if ( !touchesRef.current.has(val.path) ) {
				setTouch(val.path as FormKey<T>, true, true);
			}
			if ( 
				!changedKeysRef.current.has(val.path as FormKey<T>) 
				&& !(
					validationErrorsRef.current
					.some((prevVal) => (
						prevVal.path === val.path
						&& val.error === prevVal.error
					))
				)
			) {
				changedKeysRef.current.add(val.path as FormKey<T>);
			}
		});

		renderNewErrors(newErrors);

		if ( Object.keys(errorRef.current).length ) {
			// eslint-disable-next-line @typescript-eslint/only-throw-error
			throw newErrors;
		}
	};

	if ( shouldUpdateErrorsRef.current ) {
		const res = validate(changedKeys);
		res instanceof Promise ? res.then(renderNewErrors) : setErrors(res);
	}

	function getErrors<Model extends Record<string, any> = T>(
		key: FormKey<Model>, 
		{ includeChildsIntoArray = false }: GetErrorsOptions = {}
	): string[] {
		const errors = errorRef.current[key as unknown as FormKey<T>];

		return !errors 
			? []
			: includeChildsIntoArray 
				? errors.childErrors 
				: errors.errors;
	}

	const hasError = (key: FormKey<T>, options: GetErrorsOptions = {}): boolean => !!getErrors(key, options).length;

	return {
		errorRef,
		changedKeys,
		changedKeysRef,

		hasError,
		getErrors,
		validateSubmission,
		changeTouch,
		clearTouches,
		setError,
		hasTouch
	};
};
