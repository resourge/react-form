import { type ToucheType } from '../../types/formTypes';
import { deepCompare } from '../comparationUtils';
import { IS_DEV } from '../constants';
import { isObjectOrArray } from '../utils';

export type TouchType = Array<[string, ToucheType]>;

export type CacheConfig = {
	cache: WeakMap<any, any>
	function: Map<Function, {
		args: any[]
		observed: Set<string>
		result: any
		touched: Set<string>
	}>
	hasOriginalTouch: WeakMap<any, any>
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

export type FunctionsConfig = {
	getTouches: OnGetTouches
	isRendering: () => boolean
	onKeyGet: (key: string) => void
	onKeyTouch: OnKeyTouch
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
) => void | Promise<void>;

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

function getCurrentTouch(deepTarget: any, config: CacheConfig, value: any) {
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
	prop, receiver, target, cacheConfig, functionConfig, key
}: {
	cacheConfig: CacheConfig
	functionConfig: FunctionsConfig
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
			functionConfig,
			cacheConfig,
			key,
			!isNaN(lastKey as unknown as number) ? lastKey : undefined
		);

		const deepReceiver = parts.reduce((obj, key) => obj?.[key], proxy);

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

let observed: Set<string>;
/**
 * Proxy handler for tracking property accesses and mutations.
 */
function getProxyHandler<T extends object | Date | Map<any, any> | Set<any> | WeakMap<any, any>>(
	target2: T, 
	functionConfig: FunctionsConfig,
	cacheConfig: CacheConfig,
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
							functionConfig.onKeyTouch(key);
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
								functionConfig.onKeyTouch(key);
							}
							return result;
						};
					}
					if ( prop === 'set' ) {
						return function(...args: any[]) {
							const oldValue = (target as Map<any, any>).get(args[0]);

							const result = origMethod.apply(target, args);
							if ( !Object.is(oldValue, args[1]) ) {
								functionConfig.onKeyTouch(key);
							}
							return result;
						};
					}
					if ( prop === 'delete' ) {
						return function(...args: any[]) {
							const result = origMethod.apply(target, args);
							if (result) {
								functionConfig.onKeyTouch(key);
							}
							return result;
						};
					}
					if ( prop === 'clear' ) {
						return function() {
							const oldSize = (target as Map<any, any>).size;

							const result = origMethod.apply(target);
							if (oldSize !== (target as Map<any, any>).size) {
								functionConfig.onKeyTouch(key);
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
				functionConfig,
				cacheConfig,
				prop,
				receiver,
				key
			});

			const value = Reflect.get(deepTarget, deepProp, deepReceiver);
			const isArray = Array.isArray(deepTarget);
			const isPropNumber = isNaN(deepProp.toString() as unknown as number);
			const originalValue = getTargetValue(value);
			const originalTouch = cacheConfig.originalTouch.get(deepTarget);
			
			if ( 
				isArray
				&& deepProp !== 'constructor'
				&& typeof Array.prototype[deepProp as keyof typeof Array.prototype] === 'function'
			) {
				cacheConfig.originalTouch.set(deepTarget, []);
				cacheConfig.hasOriginalTouch.set(
					deepTarget, 
					new Set()
				);
			}

			// Important to maintain references
			if ( originalTouch && !isPropNumber ) {
				const hasOriginalTouch = cacheConfig.hasOriginalTouch.get(deepTarget);
				const K = constructKey(prop, key, isArray);

				if ( !hasOriginalTouch?.has(K) ) {
					const touch = functionConfig.getTouches(K);
					
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

			if ( !isArray && typeof value === 'function' && functionConfig.isRendering() ) {
				const functionCache = cacheConfig.function.get(value) ?? {
					result: undefined,
					touched: new Set(),
					args: [],
					observed: new Set()
				};

				cacheConfig.function.set(value, functionCache);
			
				return function (...args: any[]) {
					if ( 
						functionCache.touched.size
						&& deepCompare(args, functionCache.args)
					) {
						return functionCache.result;
					}

					const prevObserved = observed;
					observed = functionCache.observed;
					observed.clear();

					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					const result = value.apply(receiver, args);

					const touched = observed;
					if ( prevObserved ) {
						touched.forEach(prevObserved.add, prevObserved);
					}
					observed = prevObserved;

					functionCache.args = args;
					functionCache.result = result;
					functionCache.touched = touched;

					return result;
				};
			}

			const _key = constructKey(prop, key, isArray);
			functionConfig.onKeyGet(_key);
			observed?.add(_key);

			return (
				isObjectOrArray(originalValue) 
				&& !isImmutableBuiltin(originalValue) 
			) ? getProxy(
					originalValue, 
					functionConfig,
					cacheConfig, 
					_key,
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
				functionConfig,
				cacheConfig,
				key
			});
		
			value = getTargetValue(value);
			const isArray = Array.isArray(deepTarget);
			const previous = deepTarget[deepProp as keyof typeof deepTarget];
			const success = Reflect.set(deepTarget, deepProp, value, deepReceiver);
			
			const _key = constructKey(prop, key, isArray);

			cacheConfig.function.forEach((cache) => {
				cache.touched.delete(_key);
			});

			const touch = getCurrentTouch(deepTarget, cacheConfig, value);

			if ( 
				success 
				&& (
					!Object.is(previous, value) 
					|| (touch && touch.key !== _key)
					|| (isArray && !touch)
				) 
				&& prop !== 'length'
			) {
				functionConfig.onKeyTouch(
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
				functionConfig,
				cacheConfig,
				key
			});

			const success = Reflect.deleteProperty(deepTarget, deepProp);

			const isArray = Array.isArray(deepTarget);
			const _key = constructKey(prop, key, isArray);
			cacheConfig.function.forEach((cache) => {
				cache.touched.delete(_key);
			});

			if ( success ) {
				functionConfig.onKeyTouch(
					_key,
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
	functionConfig: FunctionsConfig,
	cacheConfig: CacheConfig,
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
	if (!cacheConfig.cache.has(reference as object)) {
		// Store the proxy in the WeakMap to handle circular references
		cacheConfig.cache.set(
			reference as object, 
			new Proxy<T>(
				target, 
				getProxyHandler(target, functionConfig, cacheConfig, key)
			)
		);
	}

	return cacheConfig.cache.get(reference as object);
}

export function observeObject<T extends object>(
	target: T, 
	config: FunctionsConfig
): T {
	return getProxy(
		target, 
		config,
		{
			cache: new WeakMap(),
			hasOriginalTouch: new WeakMap(),
			originalTouch: new WeakMap(),
			function: new Map()
		}
	);
}
