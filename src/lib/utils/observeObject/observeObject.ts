import { IS_DEV } from '../constants';
import { isObjectOrArray } from '../utils';

export type OnKeyTouch = (key: string, arrayMethod?: keyof typeof Array.prototype) => void;

const isBuiltinWithMutableMethods = (value: any) => value instanceof Date
	|| value instanceof Set
	|| value instanceof Map
	|| value instanceof WeakSet
	|| value instanceof WeakMap
	|| ArrayBuffer.isView(value);

const isBuiltinWithoutMutableMethods = (value: any) => value === null
	|| typeof value !== 'object'
	|| value instanceof RegExp
	|| value instanceof File
	|| value instanceof Blob;

const setProperty = (target: any, property: string, value: any, receiver: any, previous: any) => 
	previous !== undefined
		? Reflect.set(target, property, value, receiver)
		: Reflect.set(target, property, value);

const TARGET_VALUE = Symbol('TargetValue');

const getTargetValue = (value: any) => (value?.[TARGET_VALUE] ?? value);

/**
 * Constructs a key for the property based on the target type and key.
 */
function constructKey<T extends object | Date | Map<any, any> | Set<any> | WeakMap<any, any>>(
	target: T, 
	prop: string | symbol, 
	key: string
): string {
	const _prop = String(prop);
	return key 
		? `${key}${Array.isArray(target) ? `[${_prop}]` : `.${_prop}`}` 
		: _prop;
}

function getDeepPath<T>({
	prop, receiver, target, onKeyTouch, cache
}: {
	cache: WeakMap<any, any>
	onKeyTouch: OnKeyTouch
	prop: any
	target: any
	receiver?: any
}): {
		prop: string
		receiver: any
		target: T
	} {
	if (typeof prop === 'string' && (prop.includes('.') || prop.includes('['))) {
		const parts = prop.split(/\.|\[|\]/).filter(Boolean);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const lastKey = parts.pop()!;

		const proxy = getProxy(
			target, 
			onKeyTouch,
			cache
		);

		const _receiver = proxy[parts.join('.')];

		try {
			return {
				target: _receiver[TARGET_VALUE],
				prop: lastKey,
				receiver: _receiver
			};
		}
		catch {
			if ( IS_DEV ) {
				const error = new TypeError(`Cannot read properties of undefined (reading '${lastKey}') of ${parts.join('.')}`);

				if ( error.stack ) {
					error.stack = error.stack.substring(error.stack.indexOf('at Object.set'));
				}

				throw error;
			}
		}
	}

	return {
		target,
		prop: prop as string,
		receiver
	};
}

const arrayMethodsToIgnore = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']);

function getProxyHandler<T extends object | Date | Map<any, any> | Set<any> | WeakMap<any, any>>(
	target2: T, 
	onKeyTouch: OnKeyTouch, 
	cache: WeakMap<any, any>,
	key: string
): ProxyHandler<T> {
	if ( isBuiltinWithMutableMethods(target2) ) {
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

	let lastArrayProp: keyof typeof Array.prototype | undefined;
	return {
		get(_target, _prop, _receiver) {
			if ( arrayMethodsToIgnore.has(_prop as string) ) {
				lastArrayProp = _prop as keyof typeof Array.prototype;
			}
			
			if (typeof _prop === 'symbol' && _prop === TARGET_VALUE ) {
				return _target;
			}

			const {
				prop,
				receiver,
				target
			} = getDeepPath<T>({
				target: _target,
				cache,
				onKeyTouch,
				prop: _prop,
				receiver: _receiver
			});

			const value = Reflect.get(target, prop, receiver);
			if ( 
				isObjectOrArray(value) 
				&& !isBuiltinWithoutMutableMethods(value) 
			) {
				return getProxy(
					getTargetValue(value) ?? value, 
					onKeyTouch,
					cache, 
					constructKey(target, _prop, key)
				);
			}

			return value;
		},
		set(_target, _prop, value, _receiver) {
			const {
				target,
				prop,
				receiver
			} = getDeepPath<any>({
				prop: _prop,
				receiver: _receiver,
				target: _target,
				onKeyTouch,
				cache
			});

			value = getTargetValue(value);

			const reflectTarget = getTargetValue(target);
			const previous = reflectTarget[prop as keyof typeof reflectTarget];

			const success = setProperty(
				reflectTarget, 
				prop.toString(), 
				value, 
				receiver, 
				previous
			);

			if ( success && !Object.is(previous, value) ) {
				onKeyTouch(constructKey(target, _prop, key), lastArrayProp);
			}
			
			lastArrayProp = undefined;

			return success;
		},
		deleteProperty(_target, _prop) {
			const {
				target,
				prop
			} = getDeepPath<object>({
				prop: _prop,
				target: _target,
				onKeyTouch,
				cache
			});

			const success = Reflect.deleteProperty(target, prop);

			if ( success ) {
				onKeyTouch(constructKey(target, _prop, key));
			}

			return success;
		}
	};
}

function getProxy<T extends object>(
	target: T, 
	onKeyTouch: OnKeyTouch, 
	cache = new WeakMap<any, any>(),
	key: string = ''
): T {
	// Return existing proxy if this object is already in cache
	if (!cache.has(target as object)) {
		// Store the proxy in the WeakMap to handle circular references
		cache.set(
			target as object, 
			new Proxy<T>(
				target, 
				getProxyHandler(target, onKeyTouch, cache, key)
			)
		);
	}

	return cache.get(target as object);
}

export function observeObject<T extends object>(
	target: T, 
	onKeyTouch: OnKeyTouch
): T {
	return getProxy(target, onKeyTouch);
}
