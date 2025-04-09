import { IS_DEV } from '../constants';
import { isObjectOrArray } from '../utils';

import { type ProxyConfig } from './getProxyTypes';
import {
	constructKey,
	CONTEXT_VALUE,
	getCurrentTouch,
	getTargetValue,
	isImmutableBuiltin,
	isMutableBuiltin,
	REF,
	TARGET_VALUE
} from './getProxyUtils';

/**
 * Extracts deep properties while ensuring they exist to avoid errors.
 */
function getContext<T>({
	prop, receiver, target, config, baseKey
}: {
	baseKey: string
	config: ProxyConfig
	prop: any
	target: any
	receiver?: any
}): {
		deepProp: string
		deepReceiver: any
		deepTarget: T
		isArray: boolean
		key: string
	} {
	if (typeof prop === 'string' && (prop.includes('.') || prop.includes('['))) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const parts = prop.match(/([^\\.\\[\]]+)/g)!; 
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const lastKey = parts.pop()!;

		const proxy = getProxy(
			target, 
			config,
			baseKey,
			!isNaN(lastKey as unknown as number) ? lastKey : undefined
		);

		const deepReceiver = parts.reduce((obj, key) => obj?.[key], proxy);

		if (deepReceiver) {
			const deepTarget = deepReceiver[TARGET_VALUE];
			const isArray = Array.isArray(deepTarget);

			return {
				deepTarget,
				deepProp: lastKey,
				deepReceiver,
				isArray,
				key: constructKey(baseKey, prop, isArray)
			};
		}
		else if (IS_DEV) {
			throw new TypeError(`Cannot read properties of undefined (reading '${lastKey}')`);
		}
	}

	const isArray = Array.isArray(target);

	return {
		deepTarget: target,
		deepProp: prop as string,
		deepReceiver: receiver,
		isArray,
		key: constructKey(baseKey, prop as string, isArray)
	};
}

/**
 * Proxy handler for tracking property accesses and mutations.
 */
function getProxyHandler<T extends object | Date | Map<any, any> | Set<any> | WeakMap<any, any>>(
	target2: T, 
	config: ProxyConfig,
	baseKey: string = ''
): ProxyHandler<T> {
	const {
		cache, touchesRef, onKeyGet, onKeyTouch 
	} = config;

	if ( isMutableBuiltin(target2) ) {
		return {
			get(target, prop, receiver) {
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
							onKeyTouch(baseKey);
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
								onKeyTouch(baseKey);
							}
							return result;
						};
					}
					if ( prop === 'set' ) {
						return function(...args: any[]) {
							const oldValue = (target as Map<any, any>).get(args[0]);

							const result = origMethod.apply(target, args);
							if ( !Object.is(oldValue, args[1]) ) {
								onKeyTouch(baseKey);
							}
							return result;
						};
					}
					if ( prop === 'delete' ) {
						return function(...args: any[]) {
							const result = origMethod.apply(target, args);
							if (result) {
								onKeyTouch(baseKey);
							}
							return result;
						};
					}
					if ( prop === 'clear' ) {
						return function() {
							const oldSize = (target as Map<any, any>).size;

							const result = origMethod.apply(target);
							if (oldSize !== (target as Map<any, any>).size) {
								onKeyTouch(baseKey);
							}
							return result;
						};
					}
					if (prop === 'get') {
						return function (...args: any[]) {
							const originalValue = origMethod.apply(target, args);
							
							return isObjectOrArray(originalValue)
								&& !isImmutableBuiltin(originalValue)
								? getProxy(originalValue, config, baseKey)
								: originalValue;
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

			if (prop === CONTEXT_VALUE ) {
				config.onRemoveGetKey(baseKey);
				return target;
			}

			const {
				deepProp,
				deepReceiver,
				deepTarget,
				key,
				isArray
			} = getContext<T>({
				target,
				config,
				prop,
				receiver,
				baseKey
			});

			const value = Reflect.get(deepTarget, deepProp, deepReceiver);

			const isNumber = !isNaN(prop.toString() as unknown as number);
			const originalValue = getTargetValue(value);
			const originalTouch = cache.touch.get(deepTarget);
			
			if ( 
				isArray
				&& deepProp !== 'constructor'
				&& typeof Array.prototype[deepProp as keyof typeof Array.prototype] === 'function'
			) {
				cache.touch.set(deepTarget, {
					keys: new Set(),
					values: []
				});
			}

			// Save touches to value for updating when changing arrays
			if ( originalTouch && isNumber && !originalTouch.keys.has(key) ) {
				const touch = Array.from(touchesRef.current)
				.filter(([touchKey]) => touchKey.startsWith(key));
					
				originalTouch.values.push([
					originalValue, 
					touch.length ? {
						touch,
						key
					} : undefined
				]);
	
				originalTouch.keys.add(key);
			}

			onKeyGet(key);

			return (
				isObjectOrArray(originalValue) 
				&& !isImmutableBuiltin(originalValue) 
			) ? getProxy(
					originalValue, 
					config, 
					key,
					isNumber ? deepProp : undefined
				)
				: originalValue;
		},
		set(target, prop, value, receiver) {
			const {
				deepTarget,
				deepProp,
				deepReceiver,
				key,
				isArray
			} = getContext<any>({
				prop,
				receiver,
				target,
				config,
				baseKey
			});
		
			value = getTargetValue(value);
			const previous = deepTarget[deepProp as keyof typeof deepTarget];
			const success = Reflect.set(deepTarget, deepProp, value, deepReceiver);
			const touch = getCurrentTouch(deepTarget, cache, value);
			
			if ( 
				success 
				&& (
					!Object.is(previous, value) 
					|| (touch && touch.key !== key)
					|| (isArray && !touch)
				) 
				&& prop !== 'length'
			) {
				onKeyTouch(
					key, 
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
				deepProp,
				isArray,
				key
			} = getContext<object>({
				prop,
				target,
				config,
				baseKey
			});

			const success = Reflect.deleteProperty(deepTarget, deepProp);

			if ( success ) {
				onKeyTouch(
					key,
					{
						isArray
					}
				);
			}

			return success;
		}
	};
}

export function getProxy<T extends object>(
	target: T, 
	config: ProxyConfig,
	baseKey: string,
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
	if (!config.proxyCache.has(reference as object)) {
		// Store the proxy in the WeakMap to handle circular references
		config.proxyCache.set(
			reference as object, 
			new Proxy<T>(
				target, 
				getProxyHandler(target, config, baseKey)
			)
		);
	}

	return config.proxyCache.get(reference as object);
}

export function setFormProxy<T extends object>(target: T, config: ProxyConfig, baseKey: string = ''): T {
	if ( !target ) {
		return undefined as unknown as T;
	}

	return new Proxy<T>(
		target, 
		getProxyHandler(target, config, baseKey)
	);
}
