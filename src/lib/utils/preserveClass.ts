import * as serialijse from 'serialijse';

// eslint-disable-next-line @typescript-eslint/prefer-function-type
export function PreserveClass<T extends { new(...args: any[]): any }>(constructor: T) {
	serialijse.declarePersistable(constructor);
	return constructor
}

// eslint-disable-next-line @typescript-eslint/prefer-function-type
export function addClassToPreserve<T extends { new(...args: any[]): any }>(constructor: T) {
	serialijse.declarePersistable(constructor);
}
