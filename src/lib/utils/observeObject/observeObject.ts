import { type ToucheType } from '../../types/formTypes';
import { IS_DEV } from '../constants';
import { isObjectOrArray } from '../utils';

export type TouchType = Array<[string, ToucheType]>;

export type ObserveObjectConfig = {
	cache: WeakMap<any, any>
	getTouches: OnGetTouches
	hasOriginalTouch: WeakMap<any, any>
	onKeyTouch: OnKeyTouch
	originalTouch: WeakMap<
		any, 
		Array<[
			any,
			{
				key: string
				touch: TouchType
			} | undefined
		]>
	>
};

export type ValueMetadataType = {
	isArray: boolean
	touch?: {
		key: string
		touch: TouchType
	}
};

export type OnKeyTouch = (
	key: string, 
	metadata?: ValueMetadataType
) => void;

export type OnGetTouches = (key: string) => TouchType;

const isMutableBuiltin = (value: any) => value instanceof Date
	|| value instanceof Set
	|| value instanceof Map
	|| value instanceof WeakSet
	|| value instanceof WeakMap
	|| ArrayBuffer.isView(value);

const isImmutableBuiltin = (value: any) => value === null
	|| typeof value !== 'object'
	|| value instanceof RegExp
	|| value instanceof File
	|| value instanceof Blob;

export const TARGET_VALUE = Symbol('TargetValue');
const REF = Symbol('reference');

/** Retrieves the actual value, unwrapping proxies if necessary. */
const getTargetValue = (value: any) => (value?.[TARGET_VALUE] ?? value);

/** Constructs a key path for tracking changes in objects. */
const constructKey = (
	prop: string | symbol, 
	key: string,
	isArray: boolean
): string => {
	const _prop = String(prop);
	return key 
		? `${key}${isArray ? `[${_prop}]` : `.${_prop}`}` 
		: _prop;
};

function getCurrentTouch(deepTarget: any, config: ObserveObjectConfig, value: any) {
	const originalTouch = config.originalTouch.get(deepTarget);

	if ( originalTouch ) {
		const index = originalTouch.findIndex(([val]) => val === value);

		if ( index >= 0 ) {
			return originalTouch.splice(index, 1)[0][1];
		}
	}

	return undefined;
}

/**
 * Extracts deep properties while ensuring they exist to avoid errors.
 */
function getDeepPath<T>({
	prop, receiver, target, config, key
}: {
	config: ObserveObjectConfig
	key: string
	prop: any
	target: any
	receiver?: any
}): {
		deepProp: string
		deepReceiver: any
		deepTarget: T
	} {
	if (typeof prop === 'string' && (prop.includes('.') || prop.includes('['))) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const parts = prop.match(/([^\\.\\[\]]+)/g)!; 
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const lastKey = parts.pop()!;

		const proxy = getProxy(
			target, 
			config,
			key,
			!isNaN(lastKey as unknown as number) ? lastKey : undefined
		);

		// This is intended for it to cycle
		// const receiverKey = parts.join('.');

		const deepReceiver = parts.reduce((obj, key) => obj?.[key], proxy);
		// const _receiver = proxy[receiverKey];

		if (deepReceiver) {
			return {
				deepTarget: deepReceiver[TARGET_VALUE],
				deepProp: lastKey,
				deepReceiver
			};
		}
		else if (IS_DEV) {
			throw new TypeError(`Cannot read properties of undefined (reading '${lastKey}')`);
		}
	}

	return {
		deepTarget: target,
		deepProp: prop as string,
		deepReceiver: receiver
	};
}

/**
 * Proxy handler for tracking property accesses and mutations.
 */
function getProxyHandler<T extends object | Date | Map<any, any> | Set<any> | WeakMap<any, any>>(
	target2: T, 
	config: ObserveObjectConfig,
	key: string
): ProxyHandler<T> {
	if ( isMutableBuiltin(target2) ) {
		return {
			get(target: T, prop, receiver) {
				// Handle changes to Date methods
				let origMethod = Reflect.get(target, prop, receiver) as (...args: any[]) => any;
				
				if ( typeof prop === 'symbol' || !origMethod ) {
					return origMethod;
				}

				origMethod = origMethod.bind(target);
				if (target instanceof Date && prop.toString().includes('set')) {
					return function(...args: any[]) {
						const oldValue = target.getTime();
						const result = origMethod.call(target, args);
						if (oldValue !== target.getTime()) {
							config.onKeyTouch(key);
						}
						return result;
					};
				}

				if ( typeof origMethod === 'function' ) {
					if ( prop === 'add' ) {
						return function(...args: any[]) {
							const hasValue = (target as Map<any, any>).has(args[0]);

							const result = origMethod.apply(target, args);
							if (!hasValue) {
								config.onKeyTouch(key);
							}
							return result;
						};
					}
					if ( prop === 'set' ) {
						return function(...args: any[]) {
							const oldValue = (target as Map<any, any>).get(args[0]);

							const result = origMethod.apply(target, args);
							if ( !Object.is(oldValue, args[1]) ) {
								config.onKeyTouch(key);
							}
							return result;
						};
					}
					if ( prop === 'delete' ) {
						return function(...args: any[]) {
							const result = origMethod.apply(target, args);
							if (result) {
								config.onKeyTouch(key);
							}
							return result;
						};
					}
					if ( prop === 'clear' ) {
						return function() {
							const oldSize = (target as Map<any, any>).size;

							const result = origMethod.apply(target);
							if (oldSize !== (target as Map<any, any>).size) {
								config.onKeyTouch(key);
							}
							return result;
						};
					}
				}
				return origMethod;
			}
		};
	}

	return {
		get(target, prop, receiver) {
			if (prop === TARGET_VALUE ) {
				return target;
			}

			const {
				deepProp,
				deepReceiver,
				deepTarget
			} = getDeepPath<T>({
				target,
				config,
				prop,
				receiver,
				key
			});

			const value = Reflect.get(deepTarget, deepProp, deepReceiver);
			const isArray = Array.isArray(deepTarget);
			const isPropNumber = isNaN(deepProp.toString() as unknown as number);
			const originalValue = getTargetValue(value);
			const originalTouch = config.originalTouch.get(deepTarget);
			
			if ( 
				isArray
				&& deepProp !== 'constructor'
				&& typeof Array.prototype[deepProp as keyof typeof Array.prototype] === 'function'
			) {
				config.originalTouch.set(deepTarget, []);
				config.hasOriginalTouch.set(
					deepTarget, 
					new Set()
				);
			}

			// Important to maintain references
			if ( originalTouch && !isPropNumber ) {
				const hasOriginalTouch = config.hasOriginalTouch.get(deepTarget);
				const K = constructKey(prop, key, isArray);

				if ( !hasOriginalTouch?.has(K) ) {
					const touch = config.getTouches(K);
					
					originalTouch.push([
						originalValue, 
						touch ? {
							touch,
							key: K
						} : undefined
					]);
	
					hasOriginalTouch.add(K);
				}
			}

			return (
				isObjectOrArray(originalValue) 
				&& !isImmutableBuiltin(originalValue) 
			) ? getProxy(
					originalValue, 
					config, 
					constructKey(prop, key, isArray),
					!isPropNumber ? deepProp : undefined
				)
				: originalValue;
		},
		set(target, prop, value, receiver) {
			const {
				deepTarget,
				deepProp,
				deepReceiver
			} = getDeepPath<any>({
				prop,
				receiver,
				target,
				config,
				key
			});
		
			value = getTargetValue(value);
			const isArray = Array.isArray(deepTarget);
			const previous = deepTarget[deepProp as keyof typeof deepTarget];
			const success = Reflect.set(deepTarget, deepProp, value, deepReceiver);
			
			const _key = constructKey(prop, key, isArray);

			const touch = getCurrentTouch(deepTarget, config, value);

			if ( 
				success 
				&& (
					!Object.is(previous, value) 
					|| (touch && touch.key !== _key)
					|| (isArray && !touch)
				) 
				&& prop !== 'length'
			) {
				config.onKeyTouch(
					_key, 
					{
						touch,
						isArray: isArray || Array.isArray(value)
					}
				);
			}

			return success;
		},
		deleteProperty(target, prop) {
			const {
				deepTarget,
				deepProp
			} = getDeepPath<object>({
				prop,
				target,
				config,
				key
			});

			const success = Reflect.deleteProperty(deepTarget, deepProp);

			if ( success ) {
				const isArray = Array.isArray(deepTarget);
				config.onKeyTouch(
					constructKey(prop, key, isArray),
					{
						isArray
					}
				);
			}

			return success;
		}
	};
}

function getProxy<T extends object>(
	target: T, 
	config: ObserveObjectConfig,
	key: string = '',
	currentIndex?: string
): T {
	let reference = Reflect.get(target, REF) as undefined | { 
		currentIndex: string
		target: T
	};
	if ( currentIndex !== undefined && (!reference || reference.currentIndex !== currentIndex)) {
		reference = {
			target,
			currentIndex
		};
	
		Reflect.set(target, REF, reference);
	}

	reference ??= target as any;

	// Return existing proxy if this object is already in cache
	if (!config.cache.has(reference as object)) {
		// Store the proxy in the WeakMap to handle circular references
		config.cache.set(
			reference as object, 
			new Proxy<T>(
				target, 
				getProxyHandler(target, config, key)
			)
		);
	}

	return config.cache.get(reference as object);
}

export function observeObject<T extends object>(
	target: T, 
	onKeyTouch: OnKeyTouch, 
	getTouches: OnGetTouches
): T {
	return getProxy(
		target, 
		{
			onKeyTouch, 
			getTouches, 
			cache: new WeakMap(),
			hasOriginalTouch: new WeakMap(),
			originalTouch: new WeakMap()
		}
	);
}
