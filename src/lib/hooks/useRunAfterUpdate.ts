import { useLayoutEffect, useRef } from 'react'

/**
 * Methods to execute after update
 */
export const useRunAfterUpdate = () => {
	const ref = useRef<Function[]>([]);

	useLayoutEffect(() => {
		if ( ref.current.length ) {
			ref.current.forEach((cb) => cb());

			ref.current = [];
		}
	})

	const runAfterUpdate = (fn: Function) => {
		ref.current.push(fn);
	};

	return runAfterUpdate
}
