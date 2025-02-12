import { useEffect, useRef } from 'react';

import { type FormKey } from '../types';
import { type ValidationErrors } from '../types/errorsTypes';
import { type FormValidationType, type Touches } from '../types/formTypes';
import { forEachPossibleKey, getErrorsFromValidationErrors } from '../utils/formatErrors';

function setSubmittedFormPaths<T extends Record<string, any>>(
	obj: any, 
	setTouch: (key: FormKey<T>, touch: boolean, submitted: boolean) => void,
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
			setTouch(newPath as FormKey<T>, true, true);
			setSubmittedFormPaths(value, setTouch, filterKeysError, newPath);
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
	const touchesRef = useRef<Touches>(new Map());
	const changedKeysRef = useRef<Set<FormKey<T>>>(new Set());
	const shouldUpdateErrorsRef = useRef<boolean>(validationType === 'always');

	const clearTouches = () => {
		touchesRef.current.clear();
	};

	function setTouch<Model extends Record<string, any> = T>(
		key: FormKey<Model>,
		touch: boolean,
		submitted: boolean = false,
		isPossibilityKey: boolean = false
	) {
		const newTouch = touchesRef.current.get(key) ?? {
			submitted,
			touch
		};

		forEachPossibleKey(key, (possibilityKey) => {
			if ( key === possibilityKey) {
				newTouch.touch = isPossibilityKey ? (newTouch.touch || touch) : touch;
				newTouch.submitted = newTouch.submitted || submitted;
				return;
			}

			setTouch(possibilityKey as FormKey<Model>, touch, newTouch.submitted, true);
		});
		
		touchesRef.current.set(
			key,
			newTouch
		);
	}

	const hasTouch = <Model extends Record<string, any> = T>(key: FormKey<Model>): boolean => touchesRef.current.get(key)?.touch ?? false;

	const setSubmitTouches = (form: T, newErrors: ValidationErrors, previousErrors: ValidationErrors) => {
		setSubmittedFormPaths<T>(form, setTouch, filterKeysError);

		newErrors
		.forEach((val) => {
			const errors = getErrorsFromValidationErrors(val);
			if ( 
				!changedKeysRef.current.has(val.path as FormKey<T>) 
				|| !(
					previousErrors.some((prevVal) => {
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
	};

	const changeTouch = (
		key: FormKey<T> | string,
		touch: boolean = true
	) => {
		if ( filterKeysError && !filterKeysError(key) ) {
			return;
		}
		setTouch(key as FormKey<T>, touch);
		changedKeysRef.current.add(key as FormKey<T>);

		shouldUpdateErrorsRef.current = !(
			validationType === 'onSubmit' && !touchesRef.current.get('')?.submitted
		);
	};
	
	useEffect(() => {
		changedKeysRef.current.clear();
		shouldUpdateErrorsRef.current = false;
	});

	return {
		shouldUpdateErrorsRef,
		touchesRef,
		changedKeysRef,
		changeTouch,
		clearTouches,
		setSubmitTouches,
		hasTouch,
		setTouch
	};
};
