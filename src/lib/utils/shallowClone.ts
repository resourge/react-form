/* istanbul ignore next */
const ownKeys: (target: any) => PropertyKey[] = (
	typeof Reflect !== 'undefined' && Reflect.ownKeys ? Reflect.ownKeys 
		: typeof Object.getOwnPropertySymbols !== 'undefined'
		/* istanbul ignore next */
			? obj => {
				return Object.getOwnPropertyNames(obj).concat(
					Object.getOwnPropertySymbols(obj) as any
				)
			}
			: /* istanbul ignore next */ Object.getOwnPropertyNames
);

/* istanbul ignore next */
const getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function getOwnPropertyDescriptors(target: any) {
	// Polyfill needed for Hermes and IE, see https://github.com/facebook/hermes/issues/274
	const res: any = {}
	/* istanbul ignore next */
	ownKeys(target).forEach(key => {
		/* istanbul ignore next */
		res[key] = Object.getOwnPropertyDescriptor(target, key)
	})
	return res
}

export function shallowClone(base: any) {
	if (Array.isArray(base)) return Array.prototype.slice.call(base)

	const descriptors = getOwnPropertyDescriptors(base)

	const keys = ownKeys(descriptors)
	
	for (let i = 0; i < keys.length; i++) {
		const key: any = keys[i]
		const desc = descriptors[key]

		if ( desc.writable === false ) {
			desc.writable = !(typeof key === 'symbol')
			desc.configurable = !(typeof key === 'symbol')
		}

		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		if (desc.get || desc.set ) {
			descriptors[key] = {
				configurable: !(typeof key === 'symbol'),
				writable: !(typeof key === 'symbol'),
				enumerable: desc.enumerable,
				value: base[key]
			}
		}
	}

	return Object.create(Object.getPrototypeOf(base), descriptors)
}
