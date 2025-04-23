import { type CacheConfig } from './getProxyTypes';

export const isMutableBuiltin = (value: any) => value instanceof Date
	|| value instanceof Set
	|| value instanceof Map
	|| value instanceof WeakSet
	|| value instanceof WeakMap
	|| ArrayBuffer.isView(value);

export const isImmutableBuiltin = (value: any) => value === null
	|| typeof value !== 'object'
	|| value instanceof RegExp
	|| value instanceof File
	|| value instanceof Blob;

export const TARGET_VALUE = Symbol('TargetValue');
export const REF = Symbol('reference');

/** Retrieves the actual value, unwrapping proxies if necessary. */
export const getTargetValue = (value: any) => (value?.[TARGET_VALUE] ?? value);

/** Constructs a key path for tracking changes in objects. */
export const constructKey = (
	baseKey: string,
	prop: string | symbol, 
	isArray: boolean
): string => {
	const nextKey = String(prop);

	return baseKey 
		? `${baseKey}${isArray ? `[${nextKey}]` : `.${nextKey}`}` 
		: nextKey;
};

export function getCurrentTouch(deepTarget: any, config: CacheConfig, value: any) {
	const originalTouch = config.touch.get(deepTarget);

	if ( originalTouch ) {
		const index = originalTouch.values.findIndex(([val]) => val === value);

		if ( index >= 0 ) {
			return originalTouch.values.splice(index, 1)[0][1];
		}
	}

	return undefined;
}
