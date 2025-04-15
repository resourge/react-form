import { useEffect, useRef } from 'react';

import { type FormKey } from '../types';
import { type FormValidationType, type Touches } from '../types/formTypes';
import { forEachPossibleKey } from '../utils/utils';

export const useTouches = <T extends Record<string, any>>(validationType: FormValidationType = 'onSubmit') => {
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
		
		newTouch.touch = isPossibilityKey ? (newTouch.touch || touch) : touch;
		newTouch.submitted = newTouch.submitted || submitted;

		// Necessary for array functions
		forEachPossibleKey(key, (possibilityKey) => {
			if ( key === possibilityKey) {
				return;
			}
			setTouch(possibilityKey as FormKey<Model>, touch, newTouch.submitted, true);
		});
	}

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
		setTouch
	};
};

export type TouchesResult<T extends Record<string, any>> = ReturnType<(typeof useTouches<T>)>;
