import { type MutableRefObject } from 'react';

import { type FormKey } from '../types/FormKey';
import { type ValidationErrors } from '../types/errorsTypes';
import { type FormValidationType, type GetErrorsOptions, type ValidateSubmissionErrors } from '../types/formTypes';
import { type FormCoreOptions } from '../types/types';

import { deepCompareValidationErrors } from './comparationUtils';
import { formatErrors } from './formatErrors';
import { setSubmitDeepKeys } from './utils';

export type UseErrorsConfig<T extends Record<string, any>> = {
	keysOnRender: MutableRefObject<Set<string>>
	resolveKey: (key: string) => FormKey<T>
	stateRef: NonNullable<FormCoreOptions<T>['stateRef']>
	touchHook: FormCoreOptions<T>['touchHook']
	validate: FormCoreOptions<T>['formOptions']['validate']

	shouldIncludeError?: (key: string) => boolean
	validationType?: FormValidationType
};

export function createErrors<T extends Record<string, any>>(
	{
		validate,
		touchHook: {
			touchesRef, changedKeysRef, 
			setTouch
		},
		stateRef,
		validationType = 'onSubmit',
		resolveKey,
		shouldIncludeError,
		keysOnRender
	}: UseErrorsConfig<T>
) {
	const setErrors = (errors: ValidationErrors) => {
		// To only allow errors in areas 
		// where the camps have being touched our previously had error
		const newErrors = validationType === 'always'
			? errors
			: errors
			.filter(({ path }) => {
				const touch = touchesRef.current.get(path);

				return touch && (validationType === 'onSubmit' ? touch.submitted : touch.touch);
			});

		if (
			!deepCompareValidationErrors(newErrors, stateRef.errors)
		) {
			stateRef.errors = newErrors;
			stateRef.formErrors = formatErrors(newErrors);
			return true;
		}

		return false;
	};

	/**
	 * Validates the form
	 * @param form Current State
	 * @param changedKeys Keys that have changed
	 * @returns New validated state
	 */
	const formValidate = (form: T, changedKeys: Array<FormKey<T>>): ValidationErrors | Promise<ValidationErrors> => 
		validate?.(form, changedKeys) ?? [];

	const validateSubmission = async (
		form: T, 
		changedKeys: Array<FormKey<T>>,
		validateErrors?: ValidateSubmissionErrors
	) => {
		let newErrors = await formValidate(
			form,
			changedKeys
		);

		if ( shouldIncludeError ) {
			newErrors = newErrors
			.filter((val) => shouldIncludeError(val.path as FormKey<T>));
		}

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

		if ( validationType === 'always' ) {
			return newErrors;
		}

		if ( validationType === 'onSubmit' ) {
			setSubmitDeepKeys(
				form, 
				touchesRef.current,
				resolveKey,
				shouldIncludeError
			);
		}

		newErrors
		.forEach((val) => {
			if ( 
				!changedKeysRef.current.has(val.path as FormKey<T>) 
				&& !(
					stateRef.errors
					.some((prevVal) => (
						prevVal.path === val.path
						&& val.error === prevVal.error
					))
				)
			) {
				setTouch(val.path as FormKey<T>, true, true);
				changedKeysRef.current.add(val.path as FormKey<T>);
			}
		});

		return newErrors;
	};

	function getErrors<Model extends Record<string, any> = T>(
		key: FormKey<Model>, 
		{ includeChildsIntoArray = false, unique = true }: GetErrorsOptions = {}
	): string[] {
		const _key = resolveKey(key);

		const errors = stateRef.formErrors[_key];

		keysOnRender.current.add(_key);
		
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

	const hasError = (key: FormKey<T>, options: GetErrorsOptions = {}): boolean => !!getErrors(key, options).length;

	return {
		hasError,
		getErrors,
		validateSubmission,
		setErrors,
		formValidate
	};
}
