import type { FormKey } from './FormKey';

export type SplitStringIntoStringArray<K extends string> = K extends `${infer K1}.${infer R1}` 
	? [
		...(K1 extends '' ? [] : SplitStringIntoStringArray<K1>), 
		...(R1 extends '' ? [] : SplitStringIntoStringArray<R1>)
	] 
	: 
	(
		K extends `${infer V}[${infer N}]${infer R2}`
			? [
				...(V extends '' ? [] : SplitStringIntoStringArray<V>), 
				N, 
				...(R2 extends '' ? [] : SplitStringIntoStringArray<R2>)
			] : K extends `${infer V}[${infer N}]`
				? [...(V extends '' ? [] : SplitStringIntoStringArray<V>), N]
				: [K]
	);

export type FindNestedValue<T extends Record<any, any> | never, Keys extends string[]> = T extends never 
	? never
	: (
		Keys extends [infer E, ...infer R]
			? FindNestedValue<T[E], R extends string[] ? R : []> : T
	);

export type PathValue<T extends Record<string, any> | never, Keys = FormKey<T> | keyof T> = FindNestedValue<T, SplitStringIntoStringArray<Keys extends string ? Keys : ''>>;
