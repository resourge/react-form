import { declarePersistable } from 'serialijse';

// eslint-disable-next-line @typescript-eslint/prefer-function-type
export function PreserveClass<T extends { new(...args: any[]): any }>(constructor: T) {
	declarePersistable(constructor);
	return constructor
}

// eslint-disable-next-line @typescript-eslint/prefer-function-type
export function addClassToPreserve<T extends { new(...args: any[]): any }>(constructor: T) {
	declarePersistable(constructor);
}