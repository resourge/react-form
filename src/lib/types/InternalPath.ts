export type Primitive =
	| null
	| undefined
	| string
	| number
	| boolean
	| symbol
	| bigint;

export type BrowserNativeObject = Date | FileList | File | Blob | Map<any, any> | Set<any> | Uint16Array | Uint32Array | Uint8Array;

export type NonRecursiveType = Function | (new (...arguments_: any[]) => unknown);

export type ConcatString<Prev extends string | undefined, Next extends string> = Prev extends undefined
	? Next
	: `${Prev}${Next}`;

export type AddDot<Prev extends string | undefined, Next extends string> = 
Prev extends undefined
	? Next
	: `${Prev}.${Next}`;

export type InternalObjectPath<
	T,
	HasExtra extends boolean = false, 
	TraversedTypes = undefined,
	BaseKey extends string | undefined = undefined
> = {
	[K in keyof T]: K extends string
		? InternalPath<T[K], HasExtra, TraversedTypes | T, AddDot<BaseKey, K>> 
		: ''
}[keyof T];

export type InternalArrayPath<
	T,
	HasExtra extends boolean = false, 
	TraversedTypes = undefined,
	BaseKey extends string | undefined = undefined
> = BaseKey | InternalPath<T, HasExtra, TraversedTypes, BaseKey>;

type Index = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type LiteralUnion<
	LiteralType,
	BaseType extends Primitive
> = LiteralType | (BaseType & Record<never, never>);

export type InternalPath<
	T,
	HasExtra extends boolean = false, 
	TraversedTypes = undefined, 
	BaseKey extends string | undefined = undefined
> = (
	BaseKey extends undefined 
		? never 
		: BaseKey
) | (
	T extends Primitive | BrowserNativeObject | NonRecursiveType | TraversedTypes
		? never
		: (
			T extends Array<infer E> 
				? (
					LiteralUnion<
						InternalArrayPath<E, HasExtra, TraversedTypes, ConcatString<BaseKey, `[${Index}]`>>, 
						InternalArrayPath<E, HasExtra, TraversedTypes, ConcatString<BaseKey, `[${number}]`>>
					>
					| (
							HasExtra extends true 
								? InternalArrayPath<E, HasExtra, TraversedTypes, ConcatString<BaseKey, `[*]`>>
								: never
					)
				) : InternalObjectPath<T, HasExtra, TraversedTypes, BaseKey>
		)
);
