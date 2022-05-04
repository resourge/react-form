/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { MutableRefObject } from 'react';

import { FormNestedErrors, FormErrors } from '../types/types';

import { getKeyFromPaths } from './utils';

const KEYS = Symbol('keys')

type FormNestedErrorsProxy = { 
	[KEYS]: string[] 
}

export const createErrorProxy = <T extends Record<string, any>>(
	formErrors: MutableRefObject<FormErrors<T>>,
	baseKey: string = ''
): FormNestedErrors<T> => {
	return new Proxy<FormNestedErrorsProxy>({ } as FormNestedErrorsProxy, {
		get(target, name: string) {
			const keys: string[] = (target[KEYS] ?? (baseKey ? [baseKey] : []));

			if ( name === 'errors' ) {
				const key = getKeyFromPaths(keys);
				return formErrors.current[key] ?? []
			}

			keys.push(name);

			const proxy = createErrorProxy(formErrors) as unknown as FormNestedErrorsProxy

			proxy[KEYS] = keys

			return proxy;
		},
		set(target: any, p: symbol, value) {
			if ( p === KEYS ) {
				target[p] = value;
				return true;
			}
			return false;
		}
	}) as unknown as FormNestedErrors<T>
}
