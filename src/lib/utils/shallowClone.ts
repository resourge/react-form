/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* c8 ignore start */
const ownKeys: (target: any) => PropertyKey[] = (
	typeof Reflect !== 'undefined' && Reflect.ownKeys ? Reflect.ownKeys 
		: typeof Object.getOwnPropertySymbols !== 'undefined'
			? (obj) => {
				return Object.getOwnPropertyNames(obj).concat(
					Object.getOwnPropertySymbols(obj) as unknown as string[]
				);
			}
			: Object.getOwnPropertyNames
);

const getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function getOwnPropertyDescriptors(target: any) {
	// Polyfill needed for Hermes and IE, see https://github.com/facebook/hermes/issues/274
	const res: any = {};
	ownKeys(target).forEach((key) => {
		res[key] = Object.getOwnPropertyDescriptor(target, key);
	});
	return res;
};
/* c8 ignore stop */

/**
 * Shallow clones object/class/arrays
 * Class's maintains the class property
 * @param base 
 * @returns 
 */
export function shallowClone<T = any[] | Record<string, any>>(base: T): T {
	if ( Array.isArray(base) ) {
		return Array.prototype.slice.call(base) as unknown as T;
	}

	const descriptors: any = getOwnPropertyDescriptors(base);

	const keys = ownKeys(descriptors);
	
	for (let i = 0; i < keys.length; i++) {
		const key: any = keys[i];
		const desc = descriptors[key];

		if ( desc.writable === false ) {
			desc.writable = !(typeof key === 'symbol');
			desc.configurable = !(typeof key === 'symbol');
		}

		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		if (desc.get || desc.set ) {
			descriptors[key] = {
				configurable: !(typeof key === 'symbol'),
				writable: !(typeof key === 'symbol'),
				enumerable: desc.enumerable,
				value: (base as any)[key]
			};
		}
	}

	return Object.create(Object.getPrototypeOf(base), descriptors);
}
