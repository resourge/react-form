import { IS_DEV } from '../constants';
import { isObjectOrArray } from '../utils';
import { type ProxyConfig } from './getProxyTypes';
import {
	constructKey,
	getCurrentTouch,
	getTargetValue,
	isImmutableBuiltin,
	isMutableBuiltin,
	REF,
	TARGET_VALUE
} from './getProxyUtils';

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
			currentIndex,
			target
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

/**
 * Extracts deep properties while ensuring they exist to avoid errors.
 */
function getContext<T>({
	baseKey, config, prop, receiver, target
}: {
	baseKey: string
	config: ProxyConfig
	prop: any
	receiver?: any
	target: any
}): {
	deepProp: string
	deepReceiver: any
	deepTarget: T
	isArray: boolean
	key: string
} {
	if (typeof prop === 'string' && (prop.includes('.') || prop.includes('['))) {
		const parts = prop.match(/([^\\.\\[\]]+)/g)!; 
		const lastKey = parts.pop()!;

		const proxy = getProxy(
			target, 
			config,
			baseKey,
			isNaN(lastKey as unknown as number)
				? undefined
				: lastKey
		);

		const deepReceiver = parts.reduce((obj, key) => obj?.[key], proxy);

		if (deepReceiver) {
			const deepTarget = deepReceiver[TARGET_VALUE];
			const isArray = Array.isArray(deepTarget);

			return {
				deepProp: lastKey,
				deepReceiver,
				deepTarget,
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
		deepProp: prop as string,
		deepReceiver: receiver,
		deepTarget: target,
		isArray,
		key: constructKey(baseKey, prop as string, isArray)
	};
}

/**
 * Proxy handler for tracking property accesses and mutations.
 */
function getProxyHandler<T extends Date | Map<any, any> | object | Set<any> | WeakMap<any, any>>(
	target2: T, 
	config: ProxyConfig,
	baseKey: string = ''
): ProxyHandler<T> {
	const {
		cache, onKeyGet, onKeyTouch, touchesRef 
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
					if (['entries', 'values'].includes(prop)) {
						return function(...args: any[]) {
							const iterator = origMethod.apply(target, args);

							// Proxy the iterator result values
							return {
								next() {
									const result = iterator.next();
									if (result.done) {
										return result; 
									}

									// For `entries`, result.value is [key, value]
									if (prop === 'entries') {
										const [key, val] = result.value;
										const proxiedVal = isObjectOrArray(val) && !isImmutableBuiltin(val)
											? getProxy(val, config, baseKey)
											: val;
										return {
											done: false,
											value: [key, proxiedVal] 
										};
									}

									// For `values`, result.value is value only
									if (prop === 'values') {
										const val = result.value;
										const proxiedVal = isObjectOrArray(val) && !isImmutableBuiltin(val)
											? getProxy(val, config, baseKey)
											: val;
										return {
											done: false,
											value: proxiedVal 
										};
									}

									// For `keys`, just return as-is (keys are not proxied)
									return result;
								},
								[Symbol.iterator]() {
									return this;
								}
							};
						};
					}
				}
				return origMethod;
			}
		};
	}

	return {
		deleteProperty(target, prop) {
			const {
				deepProp,
				deepTarget,
				isArray,
				key
			} = getContext<object>({
				baseKey,
				config,
				prop,
				target
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
		},
		get(target, prop, receiver) {
			if (prop === TARGET_VALUE ) {
				return target;
			}

			const {
				deepProp,
				deepReceiver,
				deepTarget,
				isArray,
				key
			} = getContext<T>({
				baseKey,
				config,
				prop,
				receiver,
				target
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
					touch.length > 0
						? {
							key,
							touch
						}
						: undefined
				]);
	
				originalTouch.keys.add(key);
			}

			onKeyGet(key);

			return (
				isObjectOrArray(originalValue) 
				&& !isImmutableBuiltin(originalValue) 
			)
				? getProxy(
					originalValue, 
					config, 
					key,
					isNumber
						? deepProp
						: undefined
				)
				: originalValue;
		},
		set(target, prop, value, receiver) {
			const {
				deepProp,
				deepReceiver,
				deepTarget,
				isArray,
				key
			} = getContext<any>({
				baseKey,
				config,
				prop,
				receiver,
				target
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
						isArray: isArray || Array.isArray(value),
						touch
					}
				);
			}

			return success;
		}
	};
}
