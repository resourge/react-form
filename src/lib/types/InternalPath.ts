export type AddDot<Prev extends string | undefined, Next extends string> = 
	Prev extends undefined
		? Next
		: `${Prev}.${Next}`;

export type BrowserNativeObject = Blob | Date | File | FileList | Map<any, any> | Set<any> | Uint8Array | Uint16Array | Uint32Array;

export type ConcatString<Prev extends string | undefined, Next extends string> = Prev extends undefined
	? Next
	: `${Prev}${Next}`;

export type InternalArrayPath<
	T,
	HasExtra extends boolean = false, 
	TraversedTypes = undefined,
	BaseKey extends string | undefined = undefined
> = BaseKey | InternalPath<T, HasExtra, TraversedTypes, BaseKey>;

export type InternalObjectPath<
	T,
	HasExtra extends boolean = false, 
	TraversedTypes = undefined,
	BaseKey extends string | undefined = undefined
> = {
	[K in keyof T]: K extends string
		? InternalPath<T[K], HasExtra, T | TraversedTypes, AddDot<BaseKey, K>> 
		: ''
}[keyof T];

// type Index = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
// InternalArrayPath<E, HasExtra, TraversedTypes, ConcatString<BaseKey, `[${Index}]`>>
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
	T extends BrowserNativeObject | NonRecursiveType | Primitive | TraversedTypes
		? never
		: (
			T extends Array<infer E> 
				? (
						(
							HasExtra extends true 
								? InternalArrayPath<E, HasExtra, TraversedTypes, ConcatString<BaseKey, `[*]`>>
								: never
					)
					| InternalArrayPath<E, HasExtra, TraversedTypes, ConcatString<BaseKey, `[${number}]`>>
				) : InternalObjectPath<T, HasExtra, TraversedTypes, BaseKey>
		)
);

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type NonRecursiveType = Function | (new (...arguments_: any[]) => unknown);

export type Primitive =
	| bigint
	| boolean
	| null
	| number
	| string
	| symbol
	| undefined;
