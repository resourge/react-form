import { type MutableRefObject, useEffect, useRef } from 'react';

import { type FormKey } from '../types';
import { type FormValidationType, type Touches } from '../types/formTypes';
import { forEachPossibleKey } from '../utils/utils';

export type TouchesResult<T extends Record<string, any>> = {
	changedKeysRef: MutableRefObject<Set<FormKey<T>>>
	changeTouch: (key: FormKey<T> | string, touch?: boolean) => void
	hasTouch: <Model extends Record<string, any> = T>(key: FormKey<Model>) => boolean
	setTouch: <Model extends Record<string, any> = T>(key: FormKey<Model>, touch: boolean, submitted?: boolean) => void
	shouldUpdateErrorsRef: MutableRefObject<boolean>
	touchesRef: MutableRefObject<Touches>
};

export const useTouches = <T extends Record<string, any>>(validationType: FormValidationType = 'onSubmit'): TouchesResult<T> => {
	const touchesRef = useRef<Touches>(new Map());
	const changedKeysRef = useRef<Set<FormKey<T>>>(new Set());
	const shouldUpdateErrorsRef = useRef<boolean>(validationType === 'always');

	function setTouch<Model extends Record<string, any> = T>(
		key: FormKey<Model>,
		touch: boolean,
		submitted: boolean = false,
		isPossibilityKey: boolean = false
	) {
		if ( !touchesRef.current.has(key) ) {
			touchesRef.current.set(key, {
				submitted: false,
				touch: false
			});
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const newTouch = touchesRef.current.get(key)!;

		// Necessary for array functions
		forEachPossibleKey(key, (possibilityKey) => {
			if ( key === possibilityKey) {
				newTouch.touch = isPossibilityKey ? (newTouch.touch || touch) : touch;
				newTouch.submitted = newTouch.submitted || submitted;
				return;
			}
			setTouch(possibilityKey as FormKey<Model>, touch, newTouch.submitted, true);
		});
	}

	const hasTouch = <Model extends Record<string, any> = T>(key: FormKey<Model>): boolean => touchesRef.current.get(key)?.touch ?? false;

	const changeTouch = (
		key: FormKey<T> | string,
		touch: boolean = true
	) => {
		setTouch(key as FormKey<T>, touch);

		changedKeysRef.current.add(key as FormKey<T>);

		shouldUpdateErrorsRef.current = !(
			validationType === 'onSubmit' && !touchesRef.current.get('')?.submitted
		);
	};
	
	useEffect(() => {
		changedKeysRef.current.clear();
	});

	return {
		touchesRef,
		shouldUpdateErrorsRef,
		changedKeysRef,
		changeTouch,
		hasTouch,
		setTouch
	};
};
