type RecursiveKeyOfHandleValue<TValue, Text extends string> =
TValue extends Array<infer E>
	? `${Text}` | RecursiveKeyOfHandleValue<E, `${Text}[${number}]`>
	: TValue extends object
		? Text | `${Text}${RecursiveKeyOf<TValue, false>}`
		: Text;
  
type RecursiveKeyOfAccess<TKey extends string | number> = `.${TKey}`;

export type RecursiveKeyOf<TObj extends object, isFirstLevel extends boolean = true> = {
	[TKey in keyof TObj & (string | number)]:
	isFirstLevel extends true
		? RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`>
		: RecursiveKeyOfHandleValue<TObj[TKey], RecursiveKeyOfAccess<TKey>>;
}[keyof TObj & (string | number)];

export type FormKey<T extends Record<string, any>> = RecursiveKeyOf<T>
