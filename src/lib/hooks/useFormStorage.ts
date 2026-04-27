import { useEffect, useRef } from 'react';

import { type FormOptions, type UseFormReturn } from '../types';
import { deserialize, serialize } from '../utils';
import { IS_DEV } from '../utils/constants';

import { useForm } from './useForm';

type FormStorage = {
	getItem: (key: string) => (null | string) | Promise<null | string>
	removeItem: (key: string) => Promise<void> | void
	setItem: (key: string, value: string) => Promise<void> | void
};

type FormStorageOptions<T extends Record<string, any>> = FormOptions<T> & {
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
	 * Storage
	 */
	storage: FormStorage
	/**
	 * Unique id for storage
	 */
	uniqueId: string
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

	defaultValue: (() => T) | T | ({ new(): T }),
	options: FormStorageOptions<T>
): UseFormStorageReturn<T> {
	const {
		autoSyncWithStorage = true,
		onChange,
		onLoading = () => { },
		onStorageError = () => { },
		onSubmit,
		shouldClearAfterSubmit = true,
		storage,
		uniqueId,
		version = '1.0.0'
	} = options;
	if (IS_DEV // eslint-disable-next-line react-hooks/rules-of-hooks
		&& uniqueId !== useRef(uniqueId).current) {
		throw new Error('uniqueId must be a static value');
	}

	const formResult = useForm<T>(
		defaultValue as any,
		{
			...options,
			onChange: (form) => {
				onChange?.(form);
				Promise.resolve(
					storage.setItem(
						uniqueId,
						JSON.stringify({
							serializedState: {
								form: serialize(form)
							},
							version
						})
					)
				)
				.catch(onStorageError);
			},
			onSubmit: (form) => {
				onSubmit?.(form);
				if (shouldClearAfterSubmit) {
					Promise.resolve(storage.removeItem(uniqueId))
					.catch(onStorageError);
				}
			}
		}
	);

	const restoreFromStorage = async () => {
		const storageState = await storage.getItem(uniqueId);

		if (!storageState) {
			return;
		};

		const { serializedState, version: storageVersion } = JSON.parse(storageState) as {
			serializedState: { form: string }
			version: string
		};

		if (storageVersion === version) {
			const deserializeForm = deserialize<T>(serializedState.form);

			formResult.reset(deserializeForm, {
				clearTouched: false
			});
			return;
		}

		return await Promise.resolve(storage.removeItem(uniqueId))
		.catch(onStorageError);
	};

	useEffect(() => {
		if (autoSyncWithStorage) {
			(async () => {
				onLoading(true);
				try {
					await restoreFromStorage();
				}
				catch (error) {
					onStorageError(error);
				}
				finally {
					onLoading(false);
				}
			})();
		}
	}, []);

	// eslint-disable-next-line react-hooks/immutability
	(formResult as UseFormStorageReturn<T>).restoreFromStorage = restoreFromStorage;

	return (formResult as UseFormStorageReturn<T>);
}
