/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/no-implied-eval */
import { useRef } from 'react';

import { shallowClone } from '@resourge/shallow-clone';

import { FormKey } from '../types/FormKey';
import { isObject } from '../utils/utils';

type FormSetValue<T extends object> = (obj: T, val: any) => void
const setValue = <T extends object>(field: string): FormSetValue<T> => {
	return new Function('obj', 'val', `obj${field ? `.${field}` : ''} = val`) as FormSetValue<T>;
}

type FormGetValue<T extends object> = (obj: T) => T[keyof T]
const getValue = <T extends object>(field: string): FormGetValue<T> => {
	return new Function('obj', `return obj${field ? `.${field}` : ''}`) as FormGetValue<T>;
}

const createGetterSetter = <T extends object>(field: string) => {
	return {
		set: setValue<T>(field),
		get: getValue<T>(field)
	}
}

export type GetterSetter<T extends object> = {
	[key: string]: {
		set: FormSetValue<T>
		get: FormGetValue<T>
	}
}

/**
 * To get and set form values
 * 
 * @returns - `set` and `get` methods
 */
export const useGetterSetter = <T extends Record<string, any>>() => {
	const getterSetter = useRef<GetterSetter<T>>({ });

	const set = (key: FormKey<T>, form: T, value: any) => {
		if ( !getterSetter.current[key] ) {
			getterSetter.current[key] = createGetterSetter(key);
		}
		if ( isObject(value) || Array.isArray(value) ) {
			getterSetter.current[key].set(form, shallowClone(value));
		}
		else {
			getterSetter.current[key].set(form, value);
		}
	}

	const get = (key: FormKey<T>, form: T) => {
		if ( !getterSetter.current[key as string] ) {
			getterSetter.current[key as string] = createGetterSetter(key)
		}
		return getterSetter.current[key as string].get(form);
	}

	return {
		set,
		get
	}
}
