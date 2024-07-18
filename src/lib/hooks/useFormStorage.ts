/* eslint-disable @typescript-eslint/prefer-function-type */
import { useEffect, useRef } from 'react';

import { type FormOptions, type UseFormReturn } from '../types';
import { deserialize, serialize } from '../utils';

import { useForm } from './useForm';

type FormStorage = {
	getItem: (key: string) => (string | null) | Promise<string | null>
	removeItem: (key: string) => void | Promise<void>
	setItem: (key: string, value: string) => void | Promise<void>
};

type FormStorageOptions<T extends Record<string, any>> = FormOptions<T> & {
	/**
	 * Storage
	 */
	storage: FormStorage
	/**
	 * Unique id for storage
	 */
	uniqueId: string
	/**
	 * When true, will automatically sync the form data with storage one
	 * 
	 * @default true
	 */
	autoSyncWithStorage?: boolean
	/**
	 * Reading from storage can be a small delay, onLoading serves to show a loading.
	 */
	onLoading?: (isLoading: boolean) => void
	/**
	 * In case reading or writing in storage gives an error
	 */
	onStorageError?: (error: any) => void
	/**
	 * Should clear storage after submit
	 * 
	 * @default true
	 */
	shouldClearAfterSubmit?: boolean
	/**
	 * Storage version (to clear when changes are done to the form)
	 */
	version?: string
};

type UseFormStorageReturn<T extends Record<string, any>> = UseFormReturn<T> & {
	/**
	 * Serves to synchronize storage data with form data
	 */
	restoreFromStorage: () => Promise<void>
};

/**
 * Hook to create a form where changes will be saved in a storage.
 * * Note that when changes are done to form data, it's always better to change/update the version so storage data is cleared. 
 * * By default it will clear the form from storage when submitted with success.
 */
export function useFormStorage<T extends Record<string, any>>(
	defaultValue: ({ new(): T }), 
	options: FormStorageOptions<T>
): UseFormStorageReturn<T>;
export function useFormStorage<T extends Record<string, any>>(
	defaultValue: (() => T), 
	options: FormStorageOptions<T>
): UseFormStorageReturn<T>;
export function useFormStorage<T extends Record<string, any>>(
	defaultValue: T, 
	options: FormStorageOptions<T>
): UseFormStorageReturn<T>;
export function useFormStorage<T extends Record<string, any>>(
	defaultValue: T | (() => T) | ({ new(): T }), 
	options: FormStorageOptions<T>
): UseFormStorageReturn<T> {
	if ( process.env.NODE_ENV === 'development' ) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const uniqueIdRef = useRef(options.uniqueId);
		if ( options.uniqueId !== uniqueIdRef.current ) {
			throw new Error('uniqueId must be a static value');
		}
	}

	const onStorageError = options.onStorageError ?? (() => {});
	const version = options.version ?? '1.0.0';

	const formResult = useForm<T>(
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		defaultValue as any,
		{
			...options,
			onChange: (form, formState) => {
				if ( options.onChange ) {
					options.onChange(form, formState);
				}
				Promise.resolve(
					options.storage.setItem(
						options.uniqueId,
						JSON.stringify({
							version,
							serializedState: {
								form: serialize(form)
							}
						})
					)
				)
				.catch(onStorageError);
			},
			onSubmit: (form, formState) => {
				if ( options.onSubmit ) {
					options.onSubmit(form, formState);
				}
				if ( options.shouldClearAfterSubmit ?? true ) {
					Promise.resolve(options.storage.removeItem(options.uniqueId))
					.catch(onStorageError);
				}
			}
		}
	);

	const restoreFromStorage = async () => {
		const storageState = await Promise.resolve(options.storage.getItem(options.uniqueId));

		if ( storageState ) {
			const { version: storageVersion, serializedState } = JSON.parse(storageState) as { 
				serializedState: { form: string }
				version: string 
			};
			const deserializeForm = deserialize<T>(serializedState.form);
			
			if ( storageVersion === version ) {
				formResult.triggerChange((form) => {
					Object.keys(deserializeForm)
					.forEach((key) => {
						form[key as keyof typeof form] = deserializeForm[key as keyof typeof form];
					});
				});
			}
			else {
				Promise.resolve(options.storage.removeItem(options.uniqueId))
				.catch(onStorageError);
			}
		}
	};

	useEffect(() => {
		if ( options.autoSyncWithStorage ?? true ) {
			(async () => {
				const onLoading = options.onLoading ?? (() => {});
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
			})();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	(formResult as UseFormStorageReturn<T>).restoreFromStorage = restoreFromStorage;

	return (formResult as UseFormStorageReturn<T>);
}
