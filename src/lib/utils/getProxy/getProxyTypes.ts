import { type MutableRefObject } from 'react';

import { type Touches, type ToucheType } from '../../types/formTypes';

export type TouchType = Array<[string, ToucheType]>;

export type CacheConfig = {
	touch: WeakMap<
		any, 
		{
			keys: Set<string>
			values: Array<[
				any,
				{
					key: string
					touch: TouchType
				} | undefined
			]>
		}
	>
};

export type OnKeyTouchMetadataType = {
	isArray: boolean
	touch?: {
		key: string
		touch: TouchType
	}
};

export type OnKeyTouch = (
	key: string, 
	metadata?: OnKeyTouchMetadataType
) => void | Promise<void>;

export type OnGetTouches = (key: string) => TouchType;

export type ProxyConfig = {
	cache: CacheConfig
	onKeyGet: (key: string) => void
	onKeyTouch: OnKeyTouch
	onRemoveGetKey: (key: string) => void
	proxyCache: WeakMap<any, any>
	touchesRef: MutableRefObject<Touches>
};
