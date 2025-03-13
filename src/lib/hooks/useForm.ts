import { useRef } from 'react';

import { type FormErrors, type FormOptions, type UseFormReturn } from '../types/formTypes';

import { useFormCore } from './useFormCore';
import { useTouches } from './useTouches';

export function useForm<T extends Record<string, any>>(
	defaultValue: new() => T, 
	formOptions?: FormOptions<T>
): UseFormReturn<T>;
export function useForm<T extends Record<string, any>>(
	defaultValue: () => T, 
	formOptions?: FormOptions<T>
): UseFormReturn<T>;
export function useForm<T extends Record<string, any>>(
	defaultValue: T, 
	formOptions?: FormOptions<T>
): UseFormReturn<T>;
export function useForm<T extends Record<string, any>>(
	defaultValue: T | (() => T) | ((new() => T)), 
	formOptions: FormOptions<T> = {}
): UseFormReturn<T> {
	const touchHook = useTouches<T>(formOptions.validationType);
	const errorRef = useRef<FormErrors<T>>({} as FormErrors<T>);

	return useFormCore<T>({
		options: {
			touchHook,
			formOptions,
			errorRef
		},

		defaultValue,
		type: 'form'
	});
}
