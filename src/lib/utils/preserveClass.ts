import { registerClass } from './serialize';

// eslint-disable-next-line @typescript-eslint/prefer-function-type
export function PreserveClass<T extends { new(...args: any[]): any }>(constructor: T) {
	registerClass(constructor);
	return constructor
}
