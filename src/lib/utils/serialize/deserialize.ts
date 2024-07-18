/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SerializePrototypes } from './SerializePrototypes';
import { ClassRegisterError } from './errors/ClassRegisterError';
import { type SerializeMetaType, type DeserializeContext } from './types';

const DeserializeFunctions: Record<string, (value: SerializeMetaType, context: DeserializeContext) => any> = {
	[SerializePrototypes.Date]: (value: SerializeMetaType) => {
		return new Date(value.value as string);
	},
	[SerializePrototypes.BigInt]: (value: SerializeMetaType) => {
		return BigInt(value.value as string);
	},
	[SerializePrototypes.RegExp]: (value: SerializeMetaType) => {
		return new RegExp(value.value.value as string, value.value.flags as string);
	},
	[SerializePrototypes.Url]: (value: SerializeMetaType) => {
		return new URL(value.value as URL);
	},
	[SerializePrototypes.Error]: (value: SerializeMetaType) => {
		const error = new Error(
			value.value.message as string,
			{
				cause: value.value.cause
			}
		);

		error.stack = value.value.stack;

		return error;
	},
	[SerializePrototypes.Set]: (value: SerializeMetaType, context: DeserializeContext) => {
		return new Set(deserializeArray((value.value as any[]), context));
	},
	[SerializePrototypes.Map]: (value: SerializeMetaType, context: DeserializeContext) => {
		return new Map(deserializeArray((value.value as any[]), context));
	},
	[SerializePrototypes.Object]: (value: SerializeMetaType, context: DeserializeContext) => {
		return deserializeValues(value, context, {});
	},
	[SerializePrototypes.Array]: (value: SerializeMetaType, context: DeserializeContext) => {
		return deserializeArray((value.value as any[]), context);
	},
	[SerializePrototypes.Repeat]: (value: SerializeMetaType, context: DeserializeContext) => {
		const key = value.repeatKey!;

		if ( context.done[key] ) {
			return context.done[key];
		}

		context.done[key] = {};

		const metaValues = context.meta[key];

		return deserializeValues(metaValues, context, context.done[key] as Record<any, any>);
	}
};

function deserializeValues(serializedMeta: SerializeMetaType, context: DeserializeContext, initialVal: Record<any, any>) {
	const obj = initialVal;

	for (const key in serializedMeta.value) {
		const v = deserializeMeta((serializedMeta.value as Record<any, SerializeMetaType>)[key], context);
		obj[key] = v === 'undefined' ? undefined : v;
	} 

	return obj;
}

function deserializeArray(serializedMeta: any[], context: DeserializeContext) {
	return serializedMeta
	.map((value) => deserializeMeta(value as SerializeMetaType, context));
}

const createCycle = (meta: SerializeMetaType, originalMeta: Record<number, SerializeMetaType>): SerializeMetaType => {
	if ( meta.prototype === SerializePrototypes.Repeat && originalMeta[meta.repeatKey!] ) {
		return {
			...meta,
			value: originalMeta[meta.repeatKey!].value,
			prototype: SerializePrototypes.Repeat,
			repeatKey: meta.repeatKey
		};
	}

	if ( meta.value ) {
		if ( typeof meta.value === 'object' ) {
			for (const key in meta.value) {
				(meta.value as Record<any, SerializeMetaType>)[key] = createCycle((meta.value as Record<any, SerializeMetaType>)[key], originalMeta);
			} 
		}
		else {
			meta.value = (meta.value as any[]).map((value) => createCycle(value as SerializeMetaType, originalMeta));
		}
	}

	return meta;
};

function deserializeMeta(value: SerializeMetaType, context: DeserializeContext) {
	if ( value && typeof value === 'object' ) {
		const fn = DeserializeFunctions[value.prototype];

		if ( process.env.NODE_ENV === 'development' ) {
			if ( !fn ) {
				throw new ClassRegisterError(value.prototype);
			}
		}

		return fn(value, context);
	}

	return value;
}
/**
 * Deserializes serialize json into object
 * @param state 
 * @returns T
 */
export function deserialize<T extends object>(serializedMeta: string): T {
	const { json, meta } = JSON.parse(serializedMeta) as { 
		json: SerializeMetaType
		meta: Record<number, SerializeMetaType> 
	};

	Object.values(meta)
	.forEach((serializeObj) => createCycle(serializeObj, meta));

	return deserializeMeta(
		json, 
		{
			meta,
			done: {}
		}
	);
}

/**
 * Registers a class for serialization.
 * @param classObj Class
 * @param className by default it will use the classObj class name.
 */
export function registerClass(classObj: Record<string, any>, className: string = classObj.prototype.constructor.name) {
	Object.defineProperty(
		classObj.prototype.constructor, 
		'name', 
		{
			value: className 
		}
	);

	SerializePrototypes[className] = className;
	DeserializeFunctions[className] = (value, context) => Object.setPrototypeOf(deserializeValues(value, context, {}), classObj.prototype as object);
}
