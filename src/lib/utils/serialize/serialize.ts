import { type SerializePrototypeType, SerializePrototypes } from './SerializePrototypes';
import { ClassRegisterError } from './errors/ClassRegisterError';
import { isError } from './errors/utils';
import { type SerializeCache, type SerializeMetaType } from './types';

function serializeMeta(
	obj: any, 
	cache: SerializeCache
): SerializeMetaType | any {  
	switch ( typeof obj ) {
		case 'boolean':
		case 'string':
		case 'number':
		case 'symbol':
		case 'function':
			return obj;
		case 'undefined':
			return 'undefined';
		case 'bigint':
			return {
				value: obj.toString(),
				prototype: SerializePrototypes.BigInt
			};
		case 'object':
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
					value: obj.getTime(),
					prototype: SerializePrototypes.Date
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
					value: {
						value: obj.source,
						flags: obj.flags
					},
					prototype: SerializePrototypes.RegExp
				};
			}
			if (obj instanceof URL) {
				return {
					value: obj.href,
					prototype: SerializePrototypes.Url
				};
			}
			if (isError(obj)) {
				return {
					value: {
						message: obj.message,
						stack: obj.stack,
						cause: obj.cause
					},
					prototype: SerializePrototypes.Error
				};
			}

			return serializeObj(obj as Record<string, any>, cache);
		default: 
			return obj;
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
			repeatKey: cacheValue.index,
			prototype: SerializePrototypes.Repeat
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
			used: false,
			objSerializeMeta
		}
	);

	for (const key in obj) {
		(objSerializeMeta.value as Record<any, SerializeMetaType>)[key] = serializeMeta(obj[key], serializeCache);
	} 

	return objSerializeMeta;
}

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
