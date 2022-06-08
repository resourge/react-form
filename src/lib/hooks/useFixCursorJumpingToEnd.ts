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
				// Get pasted data via clipboard API
				const clipboardData = (event as ClipboardEvent).clipboardData;
				const pastedData = clipboardData?.getData('Text') ?? '';

				const value: string = String((pastedData || (event as KeyboardEvent).key) || '')

				const selectionsStart = (target.selectionStart ?? 0) + value.length;
				const selectionEnd = (target.selectionEnd ?? 0) + value.length;
				
				ref.current.set(target, () => {
					target.setSelectionRange(selectionsStart, selectionEnd)
				});
			}
		}

		// window.addEventListener('keydown', onInput)
		window.addEventListener('keydown', onInput)
		window.addEventListener('paste', onInput);

		return () => {
			window.removeEventListener('keydown', onInput)
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fieldsRef.current])
} : () => {}
