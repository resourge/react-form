import { type SerializePrototypeType, SerializePrototypes } from './SerializePrototypes';
import { ClassRegisterError } from './errors/ClassRegisterError';
import { isError } from './errors/utils';
import { type SerializeCache, type SerializeMetaType } from './types';

function serializeError(
	obj: Error
): SerializeMetaType {
	return {
		value: {
			message: obj.message,
			stack: obj.stack,
			cause: obj.cause
		},
		prototype: SerializePrototypes.Error
	};
}

function serializeUrl(
	obj: URL
): SerializeMetaType {
	return {
		value: obj.href,
		prototype: SerializePrototypes.Url
	};
}

function serializeRegExp(
	obj: RegExp
): SerializeMetaType {
	const value = obj.toString().slice(1, -1 - (obj.flags.length));

	return {
		value: {
			value,
			flags: obj.flags
		},
		prototype: SerializePrototypes.RegExp
	};
}

function serializeMap(
	obj: Map<any, any>, 
	cache: SerializeCache
): SerializeMetaType {
	return {
		prototype: SerializePrototypes.Map,
		value: Array.from(
			obj.entries(), 
			(val) => serializeMeta(val, cache)
		)
	};
}

function serializeSet(
	obj: Set<any>, 
	cache: SerializeCache
): SerializeMetaType {
	return {
		prototype: SerializePrototypes.Set,
		value: Array.from(obj.values(), (val) => serializeMeta(val, cache))
	};
}

function serializeDate(
	obj: Date
): SerializeMetaType {
	return {
		value: obj.getTime(),
		prototype: SerializePrototypes.Date
	};
}

function serializeArray(
	obj: any[], 
	cache: SerializeCache
): SerializeMetaType {
	return {
		prototype: SerializePrototypes.Array,
		value: obj.map((val) => serializeMeta(val, cache)) 
	};
}

function serializeBigInt(
	// eslint-disable-next-line @typescript-eslint/ban-types
	obj: BigInt
): SerializeMetaType {
	return {
		value: obj.toString(),
		prototype: SerializePrototypes.BigInt
	};
}

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
			return serializeBigInt(obj);
		case 'object':
			if ( !obj ) {
				return null;
			}
			if ( Array.isArray(obj) ) {
				return serializeArray(obj, cache);
			}
			if (obj instanceof Date) {
				return serializeDate(obj);
			}
			if (obj instanceof Set) {
				return serializeSet(obj, cache);
			}
			if (obj instanceof Map) {
				return serializeMap(obj, cache);
			}
			if (obj instanceof RegExp) {
				return serializeRegExp(obj);
			}
			if (obj instanceof URL) {
				return serializeUrl(obj);
			}
			if (isError(obj)) {
				return serializeError(obj);
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
	const serializeCacheValue = serializeCache.get(obj);
	if ( serializeCacheValue ) {
		if ( !serializeCacheValue.used ) {
			serializeCacheValue.used = true;

			serializeCache.set(obj, serializeCacheValue);
		}
		return {
			repeatKey: serializeCacheValue.index,
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
		prototype: SerializePrototypes[objName] ?? objName,
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
