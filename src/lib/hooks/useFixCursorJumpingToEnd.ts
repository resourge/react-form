import { ChangeEvent, useEffect, useLayoutEffect, useRef } from 'react'

const isBrowser = Boolean(window.addEventListener);

/**
 * This serves to fix a bug where async onChange resets cursor position to end
 */
export const useFixCursorJumpingToEnd = isBrowser ? () => {
	const fieldsRef = useRef<Set<string>>(new Set())

	const ref = useRef<Map<Element, Function>>(new Map());

	useLayoutEffect(() => {
		if ( ref.current.size ) {
			ref.current.forEach((cb) => cb());

			ref.current = new Map();
		}
	})

	useEffect(() => {
		const onInput = (event: any) => {
			const target = (event as ChangeEvent<HTMLInputElement>).target;
			// To preserve cursor position
			if ( target.tagName && (target.tagName.toLocaleUpperCase() === 'INPUT' || target.tagName.toLocaleUpperCase() === 'TEXTAREA') ) {
				const oldLength = target.value.length;
				const oldIdx = target.selectionEnd ?? 0;
		
				ref.current.set(target, () => {
					const newIdx = Math.max(0, target.value.length - oldLength + oldIdx);
					target.selectionStart = target.selectionEnd = newIdx;
				});
			}
		}

		window.addEventListener('keydown', onInput)
		window.addEventListener('paste', onInput);

		return () => {
			window.removeEventListener('keydown', onInput)
			window.removeEventListener('paste', onInput)
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fieldsRef.current])
} : () => {}
