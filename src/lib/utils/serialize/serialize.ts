import { ClassRegisterError } from './errors/ClassRegisterError';
import { isError } from './errors/utils';
import { SerializePrototypes, type SerializePrototypeType } from './SerializePrototypes';
import { type SerializeCache, type SerializeMetaType } from './types';

/**
 * Serializes object into json compatible.
 * @param state 
 * @returns string
 */
export function serialize(obj: Record<string, any>) {
	const cache: SerializeCache = new Map();
	
	const json = serializeObj(obj, cache);

	const meta: Record<number, SerializeMetaType> = {};
	const cacheValues = cache.values();
	for (
		const {
			index, objSerializeMeta: serializeMetaObj, used 
		} of cacheValues 
	) {
		if ( used ) {
			meta[index] = serializeMetaObj;
		}
	}

	return JSON.stringify({
		json,
		meta
	});
}

function serializeMeta(
	obj: any, 
	cache: SerializeCache
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
): any | SerializeMetaType {  
	switch ( typeof obj ) {
		case 'bigint': {
			return {
				prototype: SerializePrototypes.BigInt,
				value: obj.toString()
			};
		}
		case 'boolean':
		case 'function':
		case 'number':
		case 'string':
		case 'symbol': {
			return obj;
		}
		case 'object': {
			if ( !obj ) {
				return null;
			}
			if ( Array.isArray(obj) ) {
				return {
					prototype: SerializePrototypes.Array,
					value: obj.map((val) => serializeMeta(val, cache)) 
				};
			}
			if (obj instanceof Date) {
				return {
					prototype: SerializePrototypes.Date,
					value: obj.getTime()
				};
			}
			if (obj instanceof Set) {
				return {
					prototype: SerializePrototypes.Set,
					value: Array.from(obj, (val) => serializeMeta(val, cache))
				};
			}
			if (obj instanceof Map) {
				return {
					prototype: SerializePrototypes.Map,
					value: Array.from(obj, (val) => serializeMeta(val, cache))
				};
			}
			if (obj instanceof RegExp) {
				return {
					prototype: SerializePrototypes.RegExp,
					value: {
						flags: obj.flags,
						value: obj.source
					}
				};
			}
			if (obj instanceof URL) {
				return {
					prototype: SerializePrototypes.Url,
					value: obj.href
				};
			}
			if (isError(obj)) {
				return {
					prototype: SerializePrototypes.Error,
					value: {
						cause: obj.cause,
						message: obj.message,
						stack: obj.stack
					}
				};
			}

			return serializeObj(obj as Record<string, any>, cache);
		}
		case 'undefined': {
			return 'undefined';
		}
		default: { 
			return obj;
		}
	}
}

function serializeObj(
	obj: Record<string, any>, 
	serializeCache: SerializeCache
): SerializeMetaType {
	const cacheValue = serializeCache.get(obj);
	if ( cacheValue ) {
		if ( !cacheValue.used ) {
			cacheValue.used = true;

			serializeCache.set(obj, cacheValue);
		}
		return {
			prototype: SerializePrototypes.Repeat,
			repeatKey: cacheValue.index
		};
	}

	const objName: keyof SerializePrototypeType = (
		obj.prototype
			? obj.prototype.constructor.name
			: obj.constructor.name
	) as keyof SerializePrototypeType;

	const prototype = SerializePrototypes[objName];

	if ( !prototype ) {
		throw new ClassRegisterError(objName as string);
	}

	const objSerializeMeta: SerializeMetaType = {
		prototype: prototype ?? objName,
		value: {}
	};

	// This needs to be before the next line
	serializeCache.set(
		obj, 
		{
			index: serializeCache.size,
			objSerializeMeta,
			used: false
		}
	);

	for (const key in obj) {
		(objSerializeMeta.value as Record<any, SerializeMetaType>)[key] = serializeMeta(obj[key], serializeCache);
	} 

	return objSerializeMeta;
}
