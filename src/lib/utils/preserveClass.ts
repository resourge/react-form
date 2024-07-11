import { registerClass } from './serialize';

// eslint-disable-next-line @typescript-eslint/prefer-function-type, @typescript-eslint/no-unused-vars
export function PreserveClass<T extends { new(...args: any[]): any }>(constructor: T, _: any) {
	registerClass(constructor);
	return constructor;
}
