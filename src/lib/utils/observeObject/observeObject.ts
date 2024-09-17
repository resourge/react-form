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

const getTargetValue = (value: any) => value
	? (value[TARGET_VALUE] ?? value)
	: value;

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
				const origMethod = Reflect.get(target, prop, receiver) as (...args: any[]) => any;
				
				if ( typeof prop === 'symbol' || !origMethod ) {
					return origMethod;
				}

				if (target instanceof Date && prop.toString().includes('set')) {
					return function(...args: any[]) {
						const oldValue = target.getTime();
						const result = origMethod.apply(target, args);
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
			if (typeof prop === 'symbol' && prop === TARGET_VALUE ) {
				return target;
			}

			const value: any = Reflect.get(target, prop, receiver);
			if ( isObjectOrArray(value) && !isBuiltinWithoutMutableMethods(value) ) {
				const reflectTarget = value[TARGET_VALUE as keyof typeof value];

				return getProxy(
					reflectTarget ?? value, 
					onKeyTouch,
					cache, 
					constructKey(target, prop, key)
				);
			}

			return value;
		},
		set(target, prop, value, receiver) {
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
				onKeyTouch(constructKey(target, prop, key));
			}

			return success;
		},
		deleteProperty(target, prop) {
			const success = Reflect.deleteProperty(target, prop);

			if ( success ) {
				onKeyTouch(constructKey(target, prop, key));
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
