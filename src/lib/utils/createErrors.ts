import { type FormKey } from '../types/FormKey';
import { type ValidationErrors } from '../types/errorsTypes';
import { type FormValidationType, type GetErrorsOptions, type ValidateSubmissionErrors } from '../types/formTypes';
import { type FormCoreOptions } from '../types/types';

import { deepCompareValidationErrors } from './comparationUtils';
import { formatErrors } from './formatErrors';
import { setSubmitDeepKeys } from './utils';

export type UseErrorsConfig<T extends Record<string, any>> = {
	resolveKey: (key: string) => FormKey<T>
	shouldIncludeError: (key: string) => boolean
	validationErrorsRef: React.MutableRefObject<ValidationErrors>
	validationType: FormValidationType
} & FormCoreOptions<T>;

export function createErrors<T extends Record<string, any>>(
	{
		formOptions,
		touchHook: {
			touchesRef, changedKeysRef, 
			setTouch, getTouch
		},
		errorRef,
		validationType,
		validationErrorsRef,
		resolveKey,
		shouldIncludeError
	}: UseErrorsConfig<T>
) {
	const setErrors = (errors: ValidationErrors) => {
		// To only allow errors in areas 
		// where the camps have being touched our previously had error
		const newErrors = validationType === 'always'
			? errors
			: errors
			.filter(({ path }) => {
				const touch = getTouch(path as FormKey<T>);

				return touch && (validationType === 'onSubmit' ? touch.submitted : touch.touch);
			});

		if (
			!deepCompareValidationErrors(newErrors, validationErrorsRef.current)
		) {
			validationErrorsRef.current = newErrors;
			errorRef.current = formatErrors(newErrors);
			return true;
		}

		return false;
	};

	// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
	const handleSuccess = (errors: void | ValidationErrors): ValidationErrors => {
		if ( errors && errors.length ) {
			// eslint-disable-next-line @typescript-eslint/no-throw-literal, @typescript-eslint/only-throw-error
			throw errors;
		}

		return [];
	};

	/**
	 * Validates the form
	 * @param form Current State
	 * @param changedKeys Keys that have changed
	 * @returns New validated state
	 */
	const formValidate = (form: T, changedKeys: Array<FormKey<T>>): ValidationErrors | Promise<ValidationErrors> => {
		try {
			const result = formOptions.validate?.(form, changedKeys);

			return result instanceof Promise
				? result.then(handleSuccess)
				: handleSuccess(result);
		}
		catch ( err ) {
			if ( err && Array.isArray(err) ) {
				return err;
			}
			throw err as Error;
		}
	};

	const validateSubmission = async (
		form: T, 
		changedKeys: Array<FormKey<T>>,
		validateErrors?: ValidateSubmissionErrors
	) => {
		// This serves so onlyOnTouch validations still work on handleSubmit
		changedKeysRef.current.add('*' as FormKey<T>);

		let newErrors = await formValidate(
			form,
			changedKeys
		);

		if ( validateErrors ) {
			const result = await validateErrors(newErrors);

			if ( typeof result === 'boolean' ) {
				if ( !result ) {
					// eslint-disable-next-line @typescript-eslint/only-throw-error
					throw newErrors;
				}
				
				newErrors = [];
			}
			else {
				newErrors = result;
			}
		}

		switch ( validationType ) {
			case 'onSubmit':
				setSubmitDeepKeys(
					form, 
					touchesRef.current,
					resolveKey,
					shouldIncludeError
				);
				break;
			case 'onTouch':
				touchesRef.current
				.forEach((_, key) => {
					if (!shouldIncludeError || shouldIncludeError(key as FormKey<T>)) {
						setTouch(key as FormKey<T>, true, true);
					}
				});
				break;
		}

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

		return newErrors;
	};

	function getErrors<Model extends Record<string, any> = T>(
		key: FormKey<Model>, 
		{ includeChildsIntoArray = false, unique = true }: GetErrorsOptions = {}
	): string[] {
		const errors = errorRef.current[resolveKey(key)];

		if ( !errors ) {
			return [];
		}

		const e = unique 
			? errors.form
			: errors.every;

		return includeChildsIntoArray 
			? e.child
			: e.errors;
	}

	const hasError = (key: FormKey<T>, options: GetErrorsOptions = {}): boolean => !!getErrors(resolveKey(key), options).length;

	return {
		hasError,
		getErrors,
		validateSubmission,
		setErrors,
		formValidate
	};
}
