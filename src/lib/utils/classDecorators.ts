
export const classDecorator = Symbol('classDecorators')

const addClassDecorator = (target: any, propertyKey: string, value: any) => {
	const classDecorators: Map<string, any> = Reflect.get(
		target, 
		classDecorator
	) ?? new Map();

	classDecorators.set(propertyKey, value);
	Reflect.defineProperty(target, classDecorator, {
		value: classDecorators
	})
}

/**
 * Serves to preserve the class inside an array when converting from JSON to Data
 */
export function PreserveArrayClass(value: new() => any ) {
	return (target: any, propertyKey: string) => {
		addClassDecorator(target, `${propertyKey}[*]`, value)
	};
}

/**
 * Serves to preserve the class when converting from JSON to Data
 */
export function PreserveClass(value: new() => any ) {
	return (target: any, propertyKey: string) => {
		addClassDecorator(target, propertyKey, value)
	};
}
