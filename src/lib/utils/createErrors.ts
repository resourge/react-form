import { type FormKey } from '../types/FormKey';
import { type ValidationError, type ValidationErrors } from '../types/errorsTypes';
import { type FormValidationType, type GetErrorsOptions } from '../types/formTypes';
import { type FormCoreOptions, type OnRenderType } from '../types/types';

import { deepCompareValidationErrors } from './comparationUtils';
import { formatErrors } from './formatErrors';

export type UseErrorsConfig<T extends Record<string, any>> = {
	onRender: OnRenderType
	resolveKey: (key: string) => FormKey<T>
	stateRef: NonNullable<FormCoreOptions<T>['stateRef']>
	touchHook: FormCoreOptions<T>['touchHook']
	validationType?: FormValidationType
};

export function createErrors<T extends Record<string, any>>(
	{
		touchHook: { touchesRef },
		stateRef,
		validationType,
		resolveKey,
		onRender
	}: UseErrorsConfig<T>
) {
	function check(key: string) {
		for (const [keyRender, onRender] of stateRef.formRender) {
			if ( keyRender === key || key.startsWith(keyRender) ) {
				for (const { isRendering } of onRender) {
					if ( !isRendering ) {
						return true;
					}
				}
			}
		}
		return false;
	}

	const isEqual = (item1: ValidationError, item2: ValidationError) => (
		item1.path === item2.path
		&& item1.error === item2.error
		&& check(item1.path) 
	);
	
	const setErrors = (errors: ValidationErrors, isFromSubmission = false) => {
		// To only allow errors in areas 
		// where the camps have being touched our previously had error
		const newErrors = validationType === 'always'
			? errors
			: errors
			.filter(({ path }) => {
				const touch = touchesRef.current.get(path);
				if ( touch ) {
					touch.errorWasShown = touch.errorWasShown || ( 
						touch && touch.submitted && (
							!isFromSubmission ? touch.touch : true
						)
					);
					return touch.errorWasShown;
				}
				return false;
			});
			
		if (
			!deepCompareValidationErrors(newErrors, stateRef.errors)
		) {
			stateRef.diff = [
				...newErrors.filter((item1) => !stateRef.errors.some((item2) => isEqual(item1, item2))), 
				...stateRef.errors.filter((item2) => !newErrors.some((item1) => isEqual(item1, item2)))
			];
			stateRef.errors = newErrors;
			stateRef.formErrors = formatErrors(newErrors);

			return true;
		}

		return false;
	};

	function getErrors<Model extends Record<string, any> = T>(
		key: FormKey<Model>, 
		{ includeChildsIntoArray = false, unique = true }: GetErrorsOptions = {}
	): string[] {
		const resolvedKey = resolveKey(key);
		onRender.renderKeys.set(resolvedKey, includeChildsIntoArray);

		const errors = stateRef.formErrors[resolvedKey];
		if ( !errors ) {
			return [];
		}

		const list = unique 
			? errors.form
			: errors.every;

		return includeChildsIntoArray 
			? list.child
			: list.errors;
	}

	const hasError = (key: FormKey<T>, options: GetErrorsOptions = {}): boolean => !!getErrors(key, options).length;

	return {
		hasError,
		getErrors,
		setErrors
	};
}
