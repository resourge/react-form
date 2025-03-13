import { useEffect, useRef } from 'react';

import { type FormKey } from '../types';
import { type ToucheType, type FormValidationType, type Touches } from '../types/formTypes';
import { forEachPossibleKey } from '../utils/utils';

export type TouchesResult<T extends Record<string, any>> = {
	changedKeysRef: React.MutableRefObject<Set<FormKey<T>>>
	changeTouch: (key: FormKey<T> | string, touch?: boolean) => void
	getTouch: <Model extends Record<string, any> = T>(key: FormKey<Model>) => ToucheType
	hasTouch: <Model extends Record<string, any> = T>(key: FormKey<Model>) => boolean
	setTouch: <Model extends Record<string, any> = T>(key: FormKey<Model>, touch: boolean, submitted?: boolean, isPossibilityKey?: boolean) => void
	shouldUpdateErrorsRef: React.MutableRefObject<boolean>
	touchesRef: React.MutableRefObject<Touches>
};

export const useTouches = <T extends Record<string, any>>(validationType: FormValidationType = 'onSubmit'): TouchesResult<T> => {
	const touchesRef = useRef<Touches>(new Map());
	const changedKeysRef = useRef<Set<FormKey<T>>>(new Set());
	const shouldUpdateErrorsRef = useRef<boolean>(validationType === 'always');

	const getTouch = <Model extends Record<string, any> = T>(key: FormKey<Model>): ToucheType => {
		if ( !touchesRef.current.has(key) ) {
			touchesRef.current.set(key, {
				submitted: false,
				touch: false
			});
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return touchesRef.current.get(key)!;
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
		touchesRef,
		shouldUpdateErrorsRef,
		changedKeysRef,
		changeTouch,
		hasTouch,
		setTouch,
		getTouch
	};
};
