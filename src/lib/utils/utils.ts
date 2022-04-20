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

export const getKeyFromPaths = <T extends object>(paths: string[]): FormKey<T> => {
	return paths
	.map((key) => `${isNumeric(key) ? `[${key}]` : `${key}`}`)
	.join('.')
	.replace(/\.\[/g, '[') as FormKey<T>
}
