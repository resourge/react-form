import {
	ChangeEvent,
	useEffect,
	useLayoutEffect,
	useRef
} from 'react'

const InputTypeSupportedCursor = [
	'TEXT'
]

const isBrowser = Boolean(typeof document !== 'undefined');

/**
 * This serves to fix a bug where async onChange resets cursor position to end
 */
export const useFixCursorJumpingToEnd = isBrowser ? () => {} : () => {}
