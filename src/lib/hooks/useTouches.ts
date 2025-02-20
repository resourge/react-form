import { useEffect, useRef } from 'react';

import { type FormKey } from '../types';
import { type FormValidationType, type Touches } from '../types/formTypes';
import { forEachPossibleKey } from '../utils/formatErrors';

type TouchesProps = {
	touchesRef: React.MutableRefObject<Touches>
	filterKeysError?: (key: string) => boolean
	/**
	 * Validation type, specifies the type of validation.
	 * @default 'onSubmit'
	 */
	validationType?: FormValidationType
};

export const useTouches = <T extends Record<string, any>>({
	validationType, filterKeysError, touchesRef
}: TouchesProps) => {
	const changedKeysRef = useRef<Set<FormKey<T>>>(new Set());
	const shouldUpdateErrorsRef = useRef<boolean>(validationType === 'always');

	const clearTouches = () => {
		touchesRef.current.clear();
	};

	const getTouch = <Model extends Record<string, any> = T>(key: FormKey<Model>) => {
		const newTouch = touchesRef.current.get(key) ?? {
			submitted: false,
			touch: false
		};

		touchesRef.current.set(key, newTouch);

		return newTouch;
	};

	function setTouch<Model extends Record<string, any> = T>(
		key: FormKey<Model>,
		touch: boolean,
		submitted: boolean = false,
		isPossibilityKey: boolean = false
	) {
		const newTouch = getTouch(key);

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

	const hasTouch = <Model extends Record<string, any> = T>(key: FormKey<Model>): boolean => getTouch(key).touch ?? false;

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
		hasTouch,
		setTouch,
		getTouch
	};
};
