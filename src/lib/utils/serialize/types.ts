import { type SerializePrototypes } from './SerializePrototypes';

export type DeserializeContext = {
	done: Record<number, any>
	meta: Record<number, SerializeMetaType>
};

export type SerializeCache = Map<Record<string, any>, {
	index: number
	objSerializeMeta: SerializeMetaType
	used: boolean
}>;

export type SerializeMetaType = {
	prototype: typeof SerializePrototypes[keyof typeof SerializePrototypes]
	/* Exclusive to SerializePrototypeEnum.Repeat */
	repeatKey?: number
	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	value?: any | any[] | Record<any, SerializeMetaType> | SerializeMetaType[]
};
