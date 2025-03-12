import { type ChangeEvent, useRef, useState } from 'react';

import {
	type FieldForm,
	type FieldFormReturn,
	type FieldOptions,
	type FormKey,
	type ResetMethod
} from '../types';
import { type Touches } from '../types/formTypes';
import { observeObject, type OnKeyTouch, type ValueMetadataType } from '../utils/observeObject/observeObject';
import { isClass } from '../utils/utils';

import { useIsRendering } from './useIsRendering';

export type ProxyConfig<T extends Record<string, any>> = {
	defaultValue: T | (() => T) | ((new() => T))
	hasTouch: <Model extends Record<string, any> = T>(key: FormKey<Model>) => boolean
	onKeyTouch: OnKeyTouch
	touchesRef: React.MutableRefObject<Touches>
};

function createForm<T extends Record<string, any>>(
	{ 
		defaultValue, hasTouch, 
		touchesRef, onKeyTouch: _onKeyTouch
		
	}: ProxyConfig<T>,
	{
		update, isRenderingRef, preventStateUpdateRef, keysOnRender
	}: {
		isRenderingRef: React.MutableRefObject<boolean>
		keysOnRender: React.MutableRefObject<Set<string>>
		preventStateUpdateRef: React.MutableRefObject<boolean>
		update: (key?: string) => void
	}
) {
	const onKeyTouch = (key: string, metadata?: ValueMetadataType) => {
		_onKeyTouch?.(key, metadata);

		if ( !preventStateUpdateRef.current ) {
			update(key);
		}
	};

	const form = observeObject<T>(
		(
			typeof defaultValue === 'function' 
				? (
					isClass(defaultValue) 
						? new (defaultValue as new () => T)() 
						: (defaultValue as () => T)()
				) : defaultValue
		),
		{
			onKeyTouch,
			getTouches: (key: string) => Array.from(touchesRef.current).filter(([touchKey]) => touchKey.startsWith(key)),
			isRendering: () => isRenderingRef.current,
			onKeyGet: (key) => {
				if ( isRenderingRef.current ) {
					keysOnRender.current.add(key);
				}
			}
		}
	);
	
	const onChange = (
		key: FormKey<T>,
		onChange?: (value: any) => any
	) => (value: T[FormKey<T>] | ChangeEvent) => {
		const _value = (
			(value as ChangeEvent<HTMLInputElement> & { nativeEvent?: { text?: string } })?.nativeEvent?.text
			?? (value as ChangeEvent<HTMLInputElement>)?.currentTarget?.value
			?? value
		);
	
		form[key] = onChange ? onChange(_value) : _value as T[FormKey<T>];
	};

	const reset: ResetMethod<T> = (
		newFrom, 
		resetOptions = {}
	) => {
		preventStateUpdateRef.current = true;

		(Object.keys(newFrom) as Array<keyof T>)
		.forEach((key) => form[key] = newFrom[key] as T[keyof T]);

		if ( resetOptions.clearTouched ?? true ) {
			touchesRef.current.clear();
		}
		update();

		preventStateUpdateRef.current = false;
	};

	const field = ((
		key: FormKey<T>, 
		fieldOptions: FieldOptions = {}
	): FieldFormReturn => {
		const value = form[key];

		if ( fieldOptions.readOnly ) {
			return {
				name: key,
				readOnly: true,
				value
			};
		}
	
		const _onChange = onChange(key, fieldOptions.onChange);

		if ( fieldOptions.blur ) {
			return {
				name: key,
				onChange: (value: T[FormKey<T>] | ChangeEvent) => {
					preventStateUpdateRef.current = true;

					_onChange(value);

					preventStateUpdateRef.current = false;
				},
				onBlur: () => hasTouch(key) && update(key),
				defaultValue: value
			};
		}

		return {
			name: key,
			onChange: _onChange,
			value
		};
	}) as FieldForm<T>;

	return {
		form,
		changeValue: (key: FormKey<T>, value: any) => form[key] = value,
		getValue: (key: FormKey<T>) => form[key],
		reset,
		field,
		update,
		onKeyTouch
	};
}

export const useProxy = <T extends Record<string, any>>(config: ProxyConfig<T>) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setState] = useState(0);

	const update = (key?: string) => {
		if ( key && !keysOnRender.current.has(key) ) {
			return;
		}
		setState((x) => x + 1);
	};

	const keysOnRender = useRef(new Set<string>());
	// For if cases were keys stop being "used"
	keysOnRender.current.clear();
	const preventStateUpdateRef = useRef<boolean>(false);

	const isRenderingRef = useIsRendering();

	const [proxy] = useState(() => createForm<T>(
		config, 
		{
			isRenderingRef,
			preventStateUpdateRef,
			update,
			keysOnRender
		}
	));

	return proxy;
};
