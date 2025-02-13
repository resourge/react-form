import { IS_DEV } from '../constants';
import { isObjectOrArray } from '../utils';

export type ValueMetadataType = {
	isArray: boolean
	method?: string
	previousIndex?: string
};

type CacheType = {
	cache: WeakMap<any, any>
	lastArrayMethodRef: WeakMap<any, any>
	primitiveIndexCache: WeakMap<any, Array<[any, string]>>
};

export type OnKeyTouch = (
	key: string, 
	metadata?: ValueMetadataType
) => void;

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

const TARGET_VALUE = Symbol('TargetValue');
const INDEX_VALUE = Symbol('IndexValue');
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

/**
 * Extracts deep properties while ensuring they exist to avoid errors.
 */
function getDeepPath<T>({
	prop, receiver, target, onKeyTouch, cache, key
}: {
	cache: CacheType
	key: string
	onKeyTouch: OnKeyTouch
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
			onKeyTouch,
			cache,
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
	onKeyTouch: OnKeyTouch, 
	cache: CacheType,
	key: string
): ProxyHandler<T> {
	if ( isMutableBuiltin(target2) ) {
		return {
			get(target: T, prop, receiver) {
				if (prop === INDEX_VALUE ) {
					return key;
				}
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
							onKeyTouch(key);
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
								onKeyTouch(key);
							}
							return result;
						};
					}
					if ( prop === 'set' ) {
						return function(...args: any[]) {
							const oldValue = (target as Map<any, any>).get(args[0]);

							const result = origMethod.apply(target, args);
							if ( !Object.is(oldValue, args[1]) ) {
								onKeyTouch(key);
							}
							return result;
						};
					}
					if ( prop === 'delete' ) {
						return function(...args: any[]) {
							const result = origMethod.apply(target, args);
							if (result) {
								onKeyTouch(key);
							}
							return result;
						};
					}
					if ( prop === 'clear' ) {
						return function() {
							const oldSize = (target as Map<any, any>).size;

							const result = origMethod.apply(target);
							if (oldSize !== (target as Map<any, any>).size) {
								onKeyTouch(key);
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
			if (prop === INDEX_VALUE ) {
				return key;
			}
			if (prop === TARGET_VALUE ) {
				return target;
			}

			const {
				deepProp,
				deepReceiver,
				deepTarget
			} = getDeepPath<T>({
				target,
				cache,
				onKeyTouch,
				prop,
				receiver,
				key
			});

			const value = Reflect.get(deepTarget, deepProp, deepReceiver);
			// Track last accessed array method
			const isArray = Array.isArray(deepTarget);

			if ( Array.isArray(value) ) {
				cache.primitiveIndexCache.set(value, []);
			}
			
			const isPropNumber = isNaN(deepProp.toString() as unknown as number);
			
			if ( 
				isArray
				&& deepProp !== 'constructor'
				&& typeof Array.prototype[deepProp as keyof typeof Array.prototype] === 'function'
			) {
				cache.lastArrayMethodRef.set(
					deepTarget, 
					deepProp
				);
			}
			else if (
				deepProp !== 'length'
				&& deepProp !== 'constructor'
				&& isPropNumber
			) {
				cache.lastArrayMethodRef.delete(
					isArray ? deepTarget : value as any[]
				);
			}

			// Important to maintain references
			const originalValue = getTargetValue(value);
			if ( 
				isObjectOrArray(originalValue) 
				&& !isImmutableBuiltin(originalValue) 
			) {
				return getProxy(
					originalValue, 
					onKeyTouch,
					cache, 
					constructKey(prop, key, isArray),
					!isPropNumber ? deepProp : undefined
				);
			}

			// It's a way to track index's for primitive values
			if (
				!isPropNumber
				&& cache.lastArrayMethodRef.get(deepTarget)
			) {
				const primitiveIndex = cache.primitiveIndexCache.get(deepTarget);
				if ( primitiveIndex ) {
					primitiveIndex.push([originalValue, constructKey(prop, key, isArray)]);
				}
			}

			return originalValue;
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
				onKeyTouch,
				cache,
				key
			});

			const previousIndex = value?.[INDEX_VALUE]
				?? (() => {
					const primitiveIndex = cache.primitiveIndexCache.get(deepTarget);
					if ( !primitiveIndex ) {
						return undefined;
					}

					const index = primitiveIndex.findIndex(([b]) => b === value);

					if ( index < 0 ) {
						return undefined;
					}

					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const [_, prevIndex] = primitiveIndex.splice(index, 1)[0];

					cache.primitiveIndexCache.set(deepTarget, primitiveIndex);
						
					return prevIndex;
				})();

			value = getTargetValue(value);

			const previous = deepTarget[deepProp as keyof typeof deepTarget];
	
			const success = Reflect.set(deepTarget, deepProp, value, deepReceiver);
			
			if ( 
				success 
				&& !(Object.is(previous, value) && !previousIndex) 
				&& prop !== 'length'
			) {
				const isArray = Array.isArray(deepTarget);

				onKeyTouch(
					constructKey(prop, key, isArray), 
					{
						method: cache.lastArrayMethodRef.get(deepTarget as any[]),
						isArray: isArray || Array.isArray(value),
						previousIndex
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
				onKeyTouch,
				cache,
				key
			});

			const success = Reflect.deleteProperty(deepTarget, deepProp);

			if ( success ) {
				const isArray = Array.isArray(deepTarget);
				onKeyTouch(
					constructKey(prop, key, isArray),
					{
						method: cache.lastArrayMethodRef.get(deepTarget),
						isArray,
						previousIndex: undefined
					}
				);
			}

			return success;
		}
	};
}

function getProxy<T extends object>(
	target: T, 
	onKeyTouch: OnKeyTouch, 
	cache: CacheType = {
		cache: new WeakMap(),
		lastArrayMethodRef: new WeakMap(),
		primitiveIndexCache: new WeakMap()
	},
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
	if (!cache.cache.has(reference as object)) {
		// Store the proxy in the WeakMap to handle circular references
		cache.cache.set(
			reference as object, 
			new Proxy<T>(
				target, 
				getProxyHandler(target, onKeyTouch, cache, key)
			)
		);
	}

	return cache.cache.get(reference as object);
}

export function observeObject<T extends object>(
	target: T, 
	onKeyTouch: OnKeyTouch
): T {
	return getProxy(target, onKeyTouch);
}
