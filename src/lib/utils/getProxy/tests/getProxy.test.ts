import dayjs from 'dayjs';
// import onChange from 'on-change';
import {
	describe,
	expect,
	it,
	vi
} from 'vitest';

import { getProxy } from '../getProxy';
import { type ProxyConfig } from '../getProxyTypes';

function observeObject<T extends object>(
	target: T, 
	config: Omit<ProxyConfig, 'proxyCache' | 'cache' | 'getTouches' | 'touchesRef'>
): T {
	return getProxy(
		target, 
		{
			...config,
			touchesRef: {
				current: new Map()
			},
			cache: {
				touch: new WeakMap()
			},
			proxyCache: new WeakMap()
		},
		''
	);
}

describe('observeObject', () => {
	it('should call onKeyTouch when setting a property on a proxied object', () => {
		const target: any = {
			a: {
				t: 2 
		
			}
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(
			target, 
			{
				onKeyTouch,
				onKeyGet
			}
		);

		proxy.a = undefined;

		expect(onKeyTouch).toHaveBeenCalledWith('a', {
			isArray: false,
			method: undefined,
			previousIndex: undefined 
		});
		expect(proxy.a).toBe(undefined);
		expect(target.a).toBe(undefined);
	});

	it('should call onKeyTouch when setting a property on a proxied object', () => {
		const target = {
			a: 1 
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});

		proxy.a = 2;

		expect(onKeyTouch).toHaveBeenCalledWith('a', {
			isArray: false,
			method: undefined,
			previousIndex: undefined 
		});
		expect(proxy.a).toBe(2);
		expect(target.a).toBe(2);
	});

	it('should dayjs work', () => {
		const date = dayjs();
		const target = {
			date
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});

		expect(proxy.date.toISOString()).toBe(date.toISOString());

		function isBeforeCurrentDate(date: Date) {
			return dayjs(date).isBefore(new Date(), 'day');
		}

		expect(isBeforeCurrentDate(proxy.date.toDate())).toBeFalsy();
	});

	it('should compare object', () => {
		const languages = ['en', 'pt'];
		const languagesOptions = languages.map((language) => ({
			label: language,
			value: language
		}));

		const target = {
			languagesOptions,
			languages: undefined
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject<any>(target, {
			onKeyTouch,
			onKeyGet
		});

		proxy.languages = proxy.languagesOptions[0];

		expect(proxy.languages === proxy.languagesOptions[0]).toBeTruthy();
	});

	it('should compare array', () => {
		const languages = ['en', 'pt'];
		const languagesOptions = languages.map((language) => ({
			label: language,
			value: language
		}));

		const target = {
			languagesOptions,
			languages: []
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject<any>(target, {
			onKeyTouch,
			onKeyGet
		});

		const item = proxy.languagesOptions[0];

		proxy.languages = [item];

		const newValue = [...proxy.languages];
		const index = newValue.findIndex((val) => val === item);

		expect(index).not.toBe(-1);
	});

	/* it('should compare object onChange', () => {
		const languages = ['en', 'pt'];
		const languagesOptions = languages.map((language) => ({
			label: language,
			value: language
		}));

		const target = {
			languagesOptions,
			languages: []
		};
		const onKeyTouch = vi.fn();

		const proxy = onChange<any>(target, onKeyTouch);

		const item = proxy.languagesOptions[0];

		proxy.languages = [item];

		const newValue = [...proxy.languages];
		const index = newValue.findIndex((val) => val === item);

		expect(index).not.toBe(-1);
		const languages = ['en', 'pt'];
		const languagesOptions = languages.map((language) => ({
			label: language,
			value: language
		}));

		const target = {
			languagesOptions,
			languages: undefined
		};
		const onKeyTouch = vi.fn();

		const proxy = observeObject<any>(target, onKeyTouch);

		proxy.languages = proxy.languagesOptions[0];

		expect(proxy.languages === proxy.languagesOptions[0]).toBeTruthy();
	}); */

	it('should getter and setter work', () => {
		const target = {
			_a: 1,
			get a() {
				return this._a;
			},
			set a(value) {
				this._a = value;
			}
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});

		expect(proxy.a).toBe(1);

		proxy.a = 10;
		expect(proxy.a).toBe(10);
	});

	it('should not call onKeyTouch when setting a property to the same value', () => {
		const target = {
			a: 1 
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});

		proxy.a = 1;

		expect(onKeyTouch).not.toHaveBeenCalled();
		expect(proxy.a).toBe(1);
	});

	it('should call onKeyTouch when deleting a property on a proxied object', () => {
		const target = {
			a: 1 
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});

		// @ts-expect-error Expected
		delete proxy.a;

		expect(onKeyTouch).toHaveBeenCalledWith('a', {
			isArray: false,
			method: undefined,
			previousIndex: undefined 
		});
		expect(proxy.a).toBeUndefined();
		expect(target.a).toBeUndefined();
	});

	it('should handle nested objects and arrays', () => {
		const target = {
			a: {
				b: 1 
			},
			arr: [1, 2, 3] 
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});

		proxy.a.b = 2;
		proxy.arr[1] = 4;

		expect(onKeyTouch).toHaveBeenCalledWith('a.b', {
			isArray: false,
			method: undefined,
			previousIndex: undefined 
		});
		expect(onKeyTouch).toHaveBeenCalledWith('arr[1]', {
			isArray: true,
			previousIndex: undefined
		});
		expect(proxy.a.b).toBe(2);
		expect(proxy.arr[1]).toBe(4);
	});

	it('should correctly handle deeply nested objects and arrays', () => {
		const target = {
			a: {
				b: {
					c: {
						d: 1 
					} 
				} 
			},
			arr: [[1, 2], [3, 4]] 
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});

		proxy.a.b.c.d = 2;
		proxy.arr[0][1] = 5;

		expect(onKeyTouch).toHaveBeenCalledWith('a.b.c.d', {
			isArray: false,
			method: undefined,
			previousIndex: undefined 
		});
		expect(onKeyTouch).toHaveBeenCalledWith('arr[0][1]', {
			isArray: true,
			previousIndex: undefined 
		});

		expect(proxy.a.b.c.d).toBe(2);
		expect(proxy.arr[0][1]).toBe(5);
	});

	it('should handle complex interactions with built-in types', () => {
		const target = {
			date: new Date(),
			map: new Map([['key1', 'value1']]),
			set: new Set([1, 2, 3])
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});

		// Date manipulation
		const oldTime = proxy.date.getTime();
		proxy.date.setTime(oldTime + 1000);
		expect(onKeyTouch).toHaveBeenCalledWith('date');
		expect(proxy.date.getTime()).toBe(oldTime + 1000);

		// Map manipulation
		proxy.map.set('key2', 'value2');
		expect(onKeyTouch).toHaveBeenCalledWith('map');
		expect(proxy.map.get('key2')).toBe('value2');

		// Set manipulation
		proxy.set.add(4);
		expect(onKeyTouch).toHaveBeenCalledWith('set');
		expect(proxy.set.has(4)).toBe(true);

		proxy.set.delete(2);
		expect(onKeyTouch).toHaveBeenCalledWith('set');
		expect(proxy.set.has(2)).toBe(false);
	});

	it('should handle nested arrays of built-in types', () => {
		const target = {
			maps: [new Map([['key1', 'value1']]), new Map([['key2', 'value2']])],
			sets: [new Set([1, 2, 3]), new Set([4, 5, 6])]
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});

		proxy.maps[0].set('key3', 'value3');
		proxy.sets[1].add(7);

		expect(onKeyTouch).toHaveBeenCalledWith('maps[0]');
		expect(onKeyTouch).toHaveBeenCalledWith('sets[1]');
		expect(proxy.maps[0].get('key3')).toBe('value3');
		expect(proxy.sets[1].has(7)).toBe(true);
	});

	it('should handle multiple mutations on the same key', () => {
		const target = {
			a: 1 
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});

		proxy.a = 2;
		proxy.a = 3;
		proxy.a = 4;

		expect(onKeyTouch).toHaveBeenCalledTimes(3);
		expect(onKeyTouch).toHaveBeenCalledWith('a', {
			isArray: false,
			method: undefined,
			previousIndex: undefined 
		});
		expect(proxy.a).toBe(4);
	});

	it('should correctly handle adding new properties to objects', () => {
		const target: any = {};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});

		proxy.newProp = {
			nestedProp: 'value' 
		};

		expect(onKeyTouch).toHaveBeenCalledWith('newProp', {
			isArray: false,
			method: undefined,
			previousIndex: undefined 
		});
		expect(proxy.newProp.nestedProp).toBe('value');
	});

	it('should correctly handle Date objects', () => {
		const date = new Date();
		const target = {
			date 
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});

		const newDate = new Date();
		newDate.setFullYear(2025);
		proxy.date = newDate;

		expect(onKeyTouch).toHaveBeenCalledWith('date', {
			isArray: false,
			method: undefined,
			previousIndex: undefined 
		});
		expect(proxy.date.getFullYear()).toBe(2025);
	});

	it('should correctly handle Map objects', () => {
		const map = new Map();
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(map, {
			onKeyTouch,
			onKeyGet
		});

		proxy.set('key', 'value');
		expect(onKeyTouch).toHaveBeenCalledWith('');

		proxy.delete('key');
		expect(onKeyTouch).toHaveBeenCalledWith('');
	});

	it('should correctly handle circular references', () => {
		const target: any = {};
		target.self = target;
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});
		proxy.self.a = 1;

		expect(onKeyTouch).toHaveBeenCalledWith('a', {
			isArray: false,
			method: undefined,
			previousIndex: undefined 
		});
		expect(proxy.self.a).toBe(1);
	});

	it('should trigger 3 times even if value has the same reference', () => {
		const test = {
			id: 2
		};
		const target = {
			c: [test, test, test, {
				id: 1 
			}]
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});

		proxy.c.sort((a, b) => a.id - b.id); 

		expect(onKeyTouch).toHaveBeenCalledTimes(4);

		expect(onKeyTouch).toHaveBeenCalledWith('c[0]', {
			isArray: true,
			touch: undefined
		});
		expect(onKeyTouch).toHaveBeenCalledWith('c[1]', {
			isArray: true,
			touch: undefined
		});
		expect(onKeyTouch).toHaveBeenCalledWith('c[2]', {
			isArray: true,
			touch: undefined
		});
		expect(onKeyTouch).toHaveBeenCalledWith('c[3]', {
			isArray: true,
			touch: undefined
		});
	});

	it('should filter work normally', () => {
		const target = {
			mostUsed: ['test', 'test1', 'test2'],
			categories: [
				{
					type: 'test3'
				},
				{
					type: 'test'
				},
				{
					type: 'test'
				},
				{
					type: 'test'
				},
				{
					type: 'test4'
				},
				{
					type: 'test2'
				},
				{
					type: 'test1'
				}
			]
		};
		
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(target, {
			onKeyTouch,
			onKeyGet
		});

		expect(
			proxy.categories
			.filter((item) => proxy.mostUsed.includes(item.type))
			.map((item) => item.type)
		).toEqual(['test', 'test', 'test', 'test2', 'test1']);

		expect(
			proxy.categories
			.filter((item) => {
				const index = proxy.mostUsed.indexOf(item.type);

				if ( index > -1 ) {
					proxy.mostUsed.splice(index, 1);
					return true;
				}

				return false;
			})
			.map((item) => item.type)
		).toEqual(['test', 'test2', 'test1']);

		expect(proxy.mostUsed).toEqual([]);
	});
});

describe('Caching and Performance', () => {
	it('should cache proxies and avoid creating new ones for the same object', () => {
		const target = {
			a: 1,
			b: {
				c: 2 
			} 
		};
		const onKeyTouch = vi.fn();
		const onKeyGet = vi.fn();
		const proxy = observeObject(
			target, 
			{
				onKeyTouch,
				onKeyGet
			}
		);

		const nestedProxy1 = proxy.b;
		const nestedProxy2 = proxy.b;

		expect(nestedProxy1).toBe(nestedProxy2);
	});
});
