import { useEffect, useRef } from 'react';

import { type FormKey } from '../types';
import { type ValidationErrors } from '../types/errorsTypes';
import { type HasTouchOptions, type FormValidationType } from '../types/formTypes';
import { forEachPossibleKey, getErrorsFromValidationErrors } from '../utils/formatErrors';

function setSubmittedFormPaths(
	obj: any, 
	submitTouchesRef: React.MutableRefObject<Set<string>>,
	filterKeysError?: (key: string) => boolean, 
	parentPath: string = ''
) {
	if (typeof obj !== 'object' || obj === null) {
		return;
	}

	const isArray = Array.isArray(obj);

	Object.entries(obj as ArrayLike<any>)
	.forEach(([key, value]) => {
		const newPath = isArray 
			? `${parentPath}[${key}]` 
			: parentPath 
				? `${parentPath}.${key}` 
				: key;

		if (!filterKeysError || filterKeysError(newPath)) {
			submitTouchesRef.current.add(newPath);
			setSubmittedFormPaths(value, submitTouchesRef, filterKeysError, newPath);
		}
	});
}

type TouchesProps = {
	filterKeysError?: (key: string) => boolean

	/**
	 * Validation type, specifies the type of validation.
	 * @default 'onSubmit'
	 */
	validationType?: FormValidationType
};

export const useTouches = <T extends Record<string, any>>({ validationType, filterKeysError }: TouchesProps) => {
	const changedKeysRef = useRef<Set<FormKey<T>>>(new Set());
	const shouldUpdateErrorsRef = useRef<boolean>(validationType === 'always');
	const touchesRef = useRef<Record<string, boolean>>({});
	const submitTouchesRef = useRef<Set<string>>(new Set());

	const clearTouches = () => {
		touchesRef.current = {};
		submitTouchesRef.current = new Set();
	};

	function hasTouch<Model extends Record<string, any> = T>(
		key: FormKey<Model>, 
		{ includeChilds = false }: HasTouchOptions = {}
	): boolean {
		return includeChilds 
			? (
				Object.keys(touchesRef)
				.some((path) => path.includes(key) || key.includes(path))
			)
			: touchesRef.current[key];
	}

	const setSubmitTouches = (form: T, newErrors: ValidationErrors, previousErrors: ValidationErrors) => {
		if ( validationType === 'onSubmit' ) {
			submitTouchesRef.current.clear();

			setSubmittedFormPaths(form, submitTouchesRef, filterKeysError);
		}
		if ( validationType === 'onTouch' ) {
			newErrors
			.forEach((val) => {
				const errors = getErrorsFromValidationErrors(val);
				if ( 
					!changedKeysRef.current.has(val.path as FormKey<T>) 
					|| !(
						previousErrors.some((previousVal) => {
							const pE = getErrorsFromValidationErrors(previousVal);

							return previousVal.path === val.path
								&& errors.length === pE.length
								&& errors.some((error) => pE.includes(error));
						})
					)
				) {
					updateTouches(val.path as FormKey<T>, false);
				}
			});
		}
	};
	
	const updateTouches = (
		key: FormKey<T> | string,
		shouldUpdateErrors: boolean = true
	) => {
		if ( filterKeysError && !filterKeysError(key) ) {
			return;
		}

		forEachPossibleKey(key, (key) => {
			touchesRef.current[key] = true;
			changedKeysRef.current.add(key as FormKey<T>);
		});

		shouldUpdateErrorsRef.current = shouldUpdateErrors;
	};
	
	useEffect(() => {
		changedKeysRef.current.clear();
		shouldUpdateErrorsRef.current = false;
	});

	return {
		shouldUpdateErrorsRef,
		submitTouchesRef,
		touchesRef,
		changedKeysRef,
		updateTouches,
		clearTouches,
		setSubmitTouches,
		hasTouch
	};
};
