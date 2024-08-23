export type Primitive =
	| null
	| undefined
	| string
	| number
	| boolean
	| symbol
	| bigint;

type BrowserNativeObject = Date | FileList | File | Blob | Map<any, any> | Set<any> | Uint16Array | Uint32Array | Uint8Array;

type AddDotToKey<TKey extends string | number> = `.${TKey}`;
  
type ToString<TKey extends string | number> = `${TKey}`;

export type LiteralUnion<
	LiteralType,
	BaseType extends Primitive
> = LiteralType | (BaseType & Record<never, never>);

type RecursiveKeyOfHandleValue<TValue, Text extends string, TraversedTypes> =
TValue extends Primitive | BrowserNativeObject | TraversedTypes
	? Text
	: TValue extends Array<infer E>
		? `${Text}` | RecursiveKeyOfHandleValue<E, `${Text}[${number}]`, TraversedTypes>
		: TValue extends object
			? TValue extends File | Date | Blob | Map<any, any> | Set<any> | Uint16Array | Uint32Array | Uint8Array | TraversedTypes
				? Text
				: Text | `${Text}${AddDotToKey<RecursiveKeyOf<TValue, TraversedTypes | TValue>>}`
			: Text;

export type RecursiveKeyOf<TObj extends object, TraversedTypes = TObj> = {
	[TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], ToString<TKey>, TraversedTypes>;
}[keyof TObj & (string | number)];

export type FormKey<T extends Record<string, any> | any[]> = LiteralUnion<
	T extends Array<infer E>
		? RecursiveKeyOfHandleValue<E, `[${number}]`, number>
		: RecursiveKeyOf<T>, 
	string
>;
