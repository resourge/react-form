import type { FormKey } from './FormKey';

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type FindNestedValue<T extends never | Record<any, any>, Keys extends string[]> = T extends never 
	? never
	: (
		Keys extends [infer E, ...infer R]
			? FindNestedValue<T[E], R extends string[] ? R : []> : T
	);

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type PathValue<T extends never | Record<string, any>, Keys = FormKey<T> | keyof T> = FindNestedValue<T, SplitStringIntoStringArray<Keys extends string ? Keys : ''>>;

export type SplitStringIntoStringArray<K extends string> = K extends `${infer K1}.${infer R1}` 
	? [
		...(K1 extends '' ? [] : SplitStringIntoStringArray<K1>), 
		...(R1 extends '' ? [] : SplitStringIntoStringArray<R1>)
	] 
	: (
		K extends `${infer V}[${infer N}]${infer R2}`
			? [
				...(V extends '' ? [] : SplitStringIntoStringArray<V>), 
				N, 
				...(R2 extends '' ? [] : SplitStringIntoStringArray<R2>)
			] : K extends `${infer V}[${infer N}]`
				? [...(V extends '' ? [] : SplitStringIntoStringArray<V>), N]
				: [K]
	);
