/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { MutableRefObject } from 'react';

import { FormKey } from '../types/FormKey';
import { FormErrors, FormState, Touches } from '../types/types';

import { getKeyFromPaths } from './utils';

const KEYS = Symbol('keys')

type FormNestedErrorsProxy = { 
	[KEYS]: string[]
}

export type ProxyData<T extends Record<string, any>> = {
	errors: FormErrors<T>
	touches: Touches<T>
}

export const createProxy = <T extends Record<string, any>>(
	formState: MutableRefObject<ProxyData<T>>,
	baseKey: string = ''
): FormState<T> => {
	return new Proxy<FormNestedErrorsProxy>({ } as FormNestedErrorsProxy, {
		get(target, name: string) {
			const keys: string[] = (target[KEYS] ?? (baseKey ? [baseKey] : []));
			
			if ( name === 'errors' ) {
				if ( keys.length === 0 ) {
					return Object.values(formState.current.errors).flat();
				}
				const key = getKeyFromPaths<T>(keys);

				return formState.current.errors[key] ?? []
			}

			if ( name === 'isValid' ) {
				if ( keys.length === 0 ) {
					return Object.keys(formState.current.errors).length === 0;
				}
				const key = getKeyFromPaths<T>(keys);

				return (formState.current.errors[key] ?? []).length === 0;
			}

			if ( name === 'isTouched' ) {
				if ( keys.length === 0 ) {
					return Object.values(formState.current.touches)
					.some((value) => value);
				}

				const key = getKeyFromPaths<T>(keys);
				return Object.keys(
					formState.current.touches
				)
				.some((touchKey) => {
					const regex = new RegExp(`^${key.replace('[', '\\[').replace(']', '\\]')}`, 'g')

					if ( key === touchKey || regex.test(touchKey) ) {
						return formState.current.touches[touchKey as FormKey<T>]
					}

					return false;
				})
			}

			keys.push(name);

			const proxy = createProxy(formState) as unknown as FormNestedErrorsProxy

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
	}) as unknown as FormState<T>
}
