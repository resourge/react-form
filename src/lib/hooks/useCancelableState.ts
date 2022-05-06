/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { Dispatch, useRef, useState } from 'react';

/**
 * An cancelable version of `useState`.
 *
 * The difference is when setting state through a function 
 * if result is null/undefined/void useState does nothing
 * 
 * * Note: initialState cannot be undefined/null/void
 */
export function useCancelableState <S>(
	initialState: S | (() => S),
	onChange?: (oldState: S, newState: S) => void
): [S, Dispatch<S | ((prevState: S) => S | (null | undefined | void))>] {
	const [_state, _setState] = useState(initialState);
	const stateRef = useRef<S>(undefined as unknown as S);

	stateRef.current = _state;

	const setState = (state: S | ((state: S) => S | (null | undefined | void))) => {
		if ( typeof state === 'function' ) {
			// @ts-expect-error // It can be called
			const newState = state(stateRef.current);
			if ( !(newState ?? false) ) {
				return;
			}

			onChange && onChange(stateRef.current, newState)
			_setState(newState)
			return;
		}
		onChange && onChange(stateRef.current, state)
		_setState(state);
	}

	return [
		_state,
		setState
	]
}
