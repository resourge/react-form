import { RefObject } from 'react';

import { type Touches, type ToucheType } from '../../types/formTypes';

export type CacheConfig = {
	touch: WeakMap<
		any, 
		{
			keys: Set<string>
			values: Array<[
				any,
				undefined | {
					key: string
					touch: TouchType
				}
			]>
		}
	>
};

export type OnGetTouches = (key: string) => TouchType;

export type OnKeyTouch = (
	key: string, 
	metadata?: OnKeyTouchMetadataType
) => Promise<void> | void;

export type OnKeyTouchMetadataType = {
	isArray: boolean
	touch?: {
		key: string
		touch: TouchType
	}
};

export type ProxyConfig = {
	cache: CacheConfig
	onKeyGet: (key: string) => void
	onKeyTouch: OnKeyTouch
	proxyCache: WeakMap<any, any>
	touchesRef: RefObject<Touches>
};

export type TouchType = Array<[string, ToucheType]>;
