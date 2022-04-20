/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { Dispatch, useRef, useState } from 'react';

/**
 * An cancelable version of `useState`.
 *
 * The difference is when setting state through a function 
 * if result is null/undefined/void useState does nothing
 * 
 * * Nota: initialState cannot be undefined/null/void
 * 
 */
export function useCancelableState <S>(initialState: S | (() => S)): [S, Dispatch<S | ((prevState: S) => S | (null | undefined | void))>] {
	const [_state, _setState] = useState(initialState);
	const stateRef = useRef<S | undefined>(typeof initialState !== 'function' ? initialState : undefined);

	if ( !stateRef.current && typeof initialState === 'function' ) {
		// @ts-expect-error
		stateRef.current = initialState()
	}

	stateRef.current = _state;

	const setState = (state: S | ((state: S) => S | (null | undefined | void))) => {
		if ( typeof state === 'function' ) {
			// @ts-expect-error
			const newState = state(stateRef.current);
			if ( !(newState ?? false) ) {
				return;
			}

			_setState(newState)
			return;
		}
		_setState(state);
	}

	return [
		_state,
		setState
	]
}
