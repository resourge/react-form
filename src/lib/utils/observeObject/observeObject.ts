import { IS_DEV } from '../constants';

type OnKeyTouch = (key: string) => void;

function isObjectOrArray(value: any): value is object {
	return value !== null && typeof value === 'object';
}

function isBuiltinWithMutableMethods(value: any) {
	return value instanceof Date
		|| value instanceof Set
		|| value instanceof Map
		|| value instanceof WeakSet
		|| value instanceof WeakMap
		|| ArrayBuffer.isView(value);
}

function isBuiltinWithoutMutableMethods(value: any) {
	return value === null
		|| typeof value !== 'object'
		|| value instanceof RegExp;
}

function setProperty(target: any, property: string, value: any, receiver: any, previous: any) { // eslint-disable-line max-params
	return previous !== undefined
		? Reflect.set(target, property, value, receiver)
		: Reflect.set(target, property, value);
}

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

function getProxyHandler<T extends object | Date | Map<any, any> | Set<any> | WeakMap<any, any>>(
	target: T, 
	onKeyTouch: OnKeyTouch, 
	cache: WeakMap<any, any>,
	key: string
): ProxyHandler<T> {
	if ( isBuiltinWithMutableMethods(target) ) {
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

	return {
		get(_target, _prop, _receiver) {
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

			const value = target instanceof File ? Reflect.get(target, prop) : Reflect.get(target, prop, receiver);
			if ( isObjectOrArray(value) && !isBuiltinWithoutMutableMethods(value) ) {
				const reflectTarget = value[TARGET_VALUE as keyof typeof value];

				return getProxy(
					reflectTarget ?? value, 
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

			const reflectTarget = target[TARGET_VALUE as keyof typeof target] ?? target;
			const previous = reflectTarget[prop as keyof typeof reflectTarget];

			const success = setProperty(
				reflectTarget, 
				prop.toString(), 
				value, 
				receiver, 
				previous
			);

			if ( success && !Object.is(previous, value) ) {
				onKeyTouch(constructKey(target, _prop, key));
			}

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
