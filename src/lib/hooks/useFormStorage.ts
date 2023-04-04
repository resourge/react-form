/* eslint-disable @typescript-eslint/prefer-function-type */
import { useEffect, useRef } from 'react'

import localForage from 'localforage'

import { type FormKey, type FormOptions, type UseFormReturn } from '../types'
import { type State } from '../types/types'
import { parse, stringify } from '../utils/serializeJson';

import { useForm } from './useForm'

type LocalStorageFrom = {
	getItem: (key: string) => (string | null) | Promise<string | null>
	removeItem: (key: string) => void | Promise<void>
	setItem: (key: string, value: string) => void | Promise<void>
}

const localStorage: LocalStorageFrom = {
	async setItem(key: string, value: string) {
		await localForage.setItem(key, value);
	},
	getItem(key: string) {
		return localForage.getItem(key)
	},
	removeItem(key: string) {
		return localForage.removeItem(key)
	}
}

type FormStorageOptions<T extends Record<string, any>> = FormOptions<T> & {
	/**
	 * Unique id for local storage
	 */
	uniqueId: string
	/**
	 * When true, will automatically sync the form data with local storage one
	 * 
	 * @default true
	 */
	autoSyncWithLocalStorage?: boolean
	/**
	 * Reading from local storage can be a small delay, onLoading serves to show a loading.
	 */
	onLoading?: (isLoading: boolean) => void
	/**
	 * In case reading or writing in local storage gives an error
	 */
	onStorageError?: (error: any) => void
	/**
	 * Should clear local storage after submit
	 * 
	 * @default true
	 */
	shouldClearAfterSubmit?: boolean
	/**
	 * Custom storage
	 */
	storage?: LocalStorageFrom
	/**
	 * Local storage version (to clear when changes are done to the form)
	 */
	version?: string
}

type UseFormStorageReturn<T extends Record<string, any>> = UseFormReturn<T> & {
	/**
	 * Serves to synchronize local storage data with form data
	 */
	restoreFromStorage: () => Promise<void>
}

/**
 * Works the same as useForm but when changes are done it will also saves the data in a local storage (using localForage).
 * * Note that when changes are done to form data, it's always better to change/update the version so local storage data is cleared. 
 * * By default it will clear the form from local storage when submitted with success.
 */
export function useFormStorage<T extends Record<string, any>>(
	defaultValue: ({ new(): T }), 
	options: FormStorageOptions<T>
): UseFormStorageReturn<T>
export function useFormStorage<T extends Record<string, any>>(
	defaultValue: (() => T), 
	options: FormStorageOptions<T>
): UseFormStorageReturn<T>
export function useFormStorage<T extends Record<string, any>>(
	defaultValue: T, 
	options: FormStorageOptions<T>
): UseFormStorageReturn<T>
export function useFormStorage<T extends Record<string, any>>(
	defaultValue: T | (() => T) | ({ new(): T }), 
	options: FormStorageOptions<T>
): UseFormStorageReturn<T> {
	if ( __DEV__ ) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const uniqueIdRef = useRef(options.uniqueId);
		if ( options.uniqueId !== uniqueIdRef.current ) {
			throw new Error('uniqueId must be a static value')
		}
	}

	const onLoading = options?.onLoading ?? (() => {});
	const onStorageError = options?.onStorageError ?? (() => {});
	const autoSyncWithLocalStorage = options?.autoSyncWithLocalStorage ?? true;
	const version = options?.version ?? '1.0.0';
	const storage = options?.storage ?? localStorage;

	const formResult = useForm<T>(
		defaultValue as any,
		{
			...options,
			onChange: (state) => {
				if ( options?.onChange ) {
					options?.onChange(state)
				}
				Promise.resolve(storage.setItem(
					options.uniqueId,
					JSON.stringify({
						version,
						serializedState: stringify(state)
					})
				))
				.catch((e) => {
					onStorageError(e); 
				})
			},
			onSubmit: (state) => {
				if ( options?.onSubmit ) {
					options?.onSubmit(state)
				}
				if ( (options?.shouldClearAfterSubmit ?? true) ) {
					Promise.resolve(localForage.removeItem(options.uniqueId))
					.catch((e) => {
						onStorageError(e); 
					})
				}
			}
		}
	)

	const restoreFromStorage = async () => {
		const localStorageState = await Promise.resolve(storage.getItem(options.uniqueId))

		if ( localStorageState ) {
			const { version: localStorageVersion, serializedState } = JSON.parse(localStorageState);
			const state = parse<State<T>>(serializedState);
			
			if ( localStorageVersion === version ) {
				Object.keys(state.form)
				.forEach((key) => {
					formResult.updateController(key as FormKey<T>);
				});

				(formResult as UseFormReturn<T> & { _setFormState: (state: State<T>) => void })
				._setFormState(state)
			}
			else {
				Promise.resolve(localForage.removeItem(options.uniqueId))
				.catch((e) => {
					onStorageError(e); 
				})
			}
		}
	}

	useEffect(() => {
		if ( autoSyncWithLocalStorage ) {
			(async () => {
				onLoading(true);
				try {
					await restoreFromStorage();
				}
				catch ( e ) {
					onStorageError(e);
				}
				finally {
					onLoading(false);
				}
			})()
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	(formResult as UseFormStorageReturn<T>).restoreFromStorage = restoreFromStorage;

	return (formResult as UseFormStorageReturn<T>);
}
