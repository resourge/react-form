/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/no-implied-eval */
import { useRef } from 'react';

import { type FormKey } from '../types/FormKey';

type FormSetValue<T extends object> = (obj: T, val: any) => void;
export const setValue = <T extends object>(field: string): FormSetValue<T> => {
	return new Function('obj', 'val', `obj${field ? `.${field}` : ''} = val`) as FormSetValue<T>;
};

type FormGetValue<T extends object> = (obj: T) => T[keyof T];
export const getValue = <T extends object>(field: string): FormGetValue<T> => {
	return new Function('obj', `return obj${field ? `.${field}` : ''}`) as FormGetValue<T>;
};

export const createGetterSetter = <T extends object>(field: string) => ({
	set: setValue<T>(field),
	get: getValue<T>(field)
});

export type GetterSetter<T extends object> = Map<string, {
	get: FormGetValue<T>
	set: FormSetValue<T>
}>;

const MAX_LIMIT_GETTER_SETTER = 10000;

/**
 * To get and set form values
 * 
 * @returns - `set` and `get` methods
 */
export const useGetterSetter = <T extends Record<string, any>>() => {
	const getterSetter = useRef<GetterSetter<T>>(new Map());

	const checkGetterSetter = (key: FormKey<T>) => {
		if ( getterSetter.current.has(key) ) {
			return;
		}
		
		// Ensure the cache doesn't exceed the limit
		if ( getterSetter.current.size > MAX_LIMIT_GETTER_SETTER ) {
			// Remove the first (oldest) element in the Map
			const firstElementKey: string | undefined = getterSetter.current.keys()
			.next().value;
			if ( firstElementKey ) {
				getterSetter.current.delete(firstElementKey);
			}
		}
		getterSetter.current.set(key, createGetterSetter(key));
	};

	const set = (key: FormKey<T>, form: T, value: any) => {
		checkGetterSetter(key);
		getterSetter.current.get(key)!.set(form, value);
	};

	const get = (key: FormKey<T>, form: T) => {
		checkGetterSetter(key);
		return getterSetter.current.get(key)!.get(form);
	};

	return {
		set,
		get
	};
};
