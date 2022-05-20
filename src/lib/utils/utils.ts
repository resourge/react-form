import { FormKey } from '../types/FormKey';

export function isObject(value: any) {
	return toString.call(value) === '[object Object]';
}

function isNumeric(value: string | number) {
	if ( typeof value === 'number' ) {
		return true;
	}
	return /^[-]?([1-9]\d*|0)(\.\d+)?$/.test(value)
}

export const getKeyFromPaths = <T extends Record<string, any>>(paths: string[]): FormKey<T> => {
	return paths
	.map((key) => `${isNumeric(key) ? `[${key}]` : `${key}`}`)
	.join('.')
	.replace(/\.\[/g, '[') as FormKey<T>
}

export const findByInMap = (map: Map<string, number>, keyToFind: string): [string, number] | [null, 0] => {
	for (const [key, value] of map.entries()) {
		if (
			key.includes(keyToFind) || 
			keyToFind.includes(key)
		) {
			return [key, value]
		}
	}
	return [null, 0]
}
