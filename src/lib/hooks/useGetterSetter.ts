/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/no-implied-eval */
import { useRef } from 'react';

import { shallowClone } from '@resourge/shallow-clone';

import { type FormKey } from '../types/FormKey';
import { isObject } from '../utils/utils';

type FormSetValue<T extends object> = (obj: T, val: any) => void
export const setValue = <T extends object>(field: string): FormSetValue<T> => {
	return new Function('obj', 'val', `obj${field ? `.${field}` : ''} = val`) as FormSetValue<T>;
}

type FormGetValue<T extends object> = (obj: T) => T[keyof T]
export const getValue = <T extends object>(field: string): FormGetValue<T> => {
	return new Function('obj', `return obj${field ? `.${field}` : ''}`) as FormGetValue<T>;
}

export const createGetterSetter = <T extends object>(field: string) => {
	return {
		set: setValue<T>(field),
		get: getValue<T>(field)
	}
}

export type GetterSetter<T extends object> = Map<string, {
	get: FormGetValue<T>
	set: FormSetValue<T>
}>

const maxLimitOfGetterSetter = 10000;

/**
 * To get and set form values
 * 
 * @returns - `set` and `get` methods
 */
export const useGetterSetter = <T extends Record<string, any>>() => {
	const getterSetter = useRef<GetterSetter<T>>(new Map());

	const checkGetterSetter = (key: FormKey<T>) => {
		if ( !getterSetter.current.has(key) ) {
			if ( getterSetter.current.size > maxLimitOfGetterSetter ) {
				const firstElementKey = getterSetter.current.keys()
				.next().value;
				if ( firstElementKey ) {
					getterSetter.current.delete(firstElementKey)
				}
			}
			getterSetter.current.set(key, createGetterSetter(key));
		}
	}

	const set = (key: FormKey<T>, form: T, value: any) => {
		checkGetterSetter(key);
		if ( isObject(value) || Array.isArray(value) ) {
			getterSetter.current.get(key)!.set(form, shallowClone(value));
		}
		else {
			getterSetter.current.get(key)!.set(form, value);
		}
	}

	const get = (key: FormKey<T>, form: T) => {
		checkGetterSetter(key);
		return getterSetter.current.get(key)!.get(form);
	}

	return {
		set,
		get
	}
}
