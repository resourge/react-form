import { type SerializePrototypes } from './SerializePrototypes';

export type SerializeMetaType = {
	prototype: typeof SerializePrototypes[keyof typeof SerializePrototypes]
	/* Exclusive to SerializePrototypeEnum.Repeat */
	repeatKey?: number
	value?: SerializeMetaType[] | Record<any, SerializeMetaType> | any | any[]
}

export type SerializeCache = Map<Record<string, any>, { index: number, objSerializeMeta: SerializeMetaType, used: boolean }>;

export type DeserializeContext = {
	done: Record<number, any>
	meta: Record<number, SerializeMetaType>
}
