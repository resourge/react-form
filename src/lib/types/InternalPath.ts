type HasSeen<T, Seen extends readonly unknown[]> =
	T extends Seen[number] ? true : false;

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
	Seen extends readonly unknown[] = [],
	BaseKey extends string | undefined = undefined
> =
	BaseKey
	| InternalPath<T, HasExtra, Seen, BaseKey>;

export type InternalObjectPath<
	T,
	HasExtra extends boolean = false,
	Seen extends readonly unknown[] = [],
	BaseKey extends string | undefined = undefined
> = {
	[K in keyof T & string]:
	InternalPath<
		T[K],
		HasExtra,
		Seen,
		AddDot<BaseKey, K>
	>
}[keyof T & string];

// type Index = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
// InternalArrayPath<E, HasExtra, TraversedTypes, ConcatString<BaseKey, `[${Index}]`>>
export type InternalPath<
	T,
	HasExtra extends boolean = false,
	Seen extends readonly unknown[] = [],
	BaseKey extends string | undefined = undefined
> =
	| (BaseKey extends undefined ? never : BaseKey)
	| (
		T extends BrowserNativeObject | NonRecursiveType | Primitive
			? never
			: HasSeen<T, Seen> extends true
				? never
				: T extends readonly (infer E)[]
					? | (
						HasExtra extends true
							? InternalArrayPath<
								E,
								HasExtra,
								[...Seen, T],
								ConcatString<BaseKey, '[*]'>
							>
							: never
					) | InternalArrayPath<
						E,
						HasExtra,
						[...Seen, T],
						ConcatString<BaseKey, `[${number}]`>
					>
					: InternalObjectPath<
						T,
						HasExtra,
						[...Seen, T],
						BaseKey
					>
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
