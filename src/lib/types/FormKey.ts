type RecursiveKeyOfAccess2<TKey extends string | number> = `.${TKey}`;

type RecursiveKeyOfHandleValue<TValue, Text extends string, TraversedTypes = TValue> =
TValue extends Array<infer E>
	? `${Text}` | RecursiveKeyOfHandleValue<E, `${Text}[${number}]`, TraversedTypes>
	: TValue extends object
		? TValue extends File | Date | Blob | Map<any, any> | Set<any> | Uint16Array | Uint32Array | Uint8Array | TraversedTypes
			? Text
			: Text | `${Text}${RecursiveKeyOfAccess2<RecursiveKeyOf<TValue, TraversedTypes | TValue>>}`
		: Text;
  
type RecursiveKeyOfAccess<TKey extends string | number> = `${TKey}`;

export type RecursiveKeyOf<TObj extends object, TraversedTypes = TObj> = {
	[TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], RecursiveKeyOfAccess<TKey>, TraversedTypes>;
}[keyof TObj & (string | number)];

export type FormKey<T extends Record<string, any>> = RecursiveKeyOf<T>;
