/* eslint-disable no-return-assign */
import { deepmerge } from 'deepmerge-ts';

import { State } from '../types/types';

import { classDecorator } from './classDecorators';
import { isClass } from './utils';

const setPrototype = (value: any) => (prototype: any) => {
	value = Object.setPrototypeOf(
		value, 
		prototype
	)
}

const getChangedKeys = (value: any, key?: string, values: Array<[string, (value: any) => any]> = []) => {
	if ( key ) {
		values.push([
			key, 
			setPrototype(value)
		]);
	}
	
	if ( Array.isArray(value) ) {
		value
		.forEach((val, index) => {
			getChangedKeys(val, `${key ?? ''}[${index}]`, values);
		})
	}
	else if ( 
		value != null && 
		typeof value === 'object' && 
		!(value instanceof Set || value instanceof Map) 
	) {
		Object.entries(value)
		.forEach(([_key, value]) => {
			getChangedKeys(value, `${key ?? ''}${key ? `.${_key}` : _key}`, values);
		})
	}

	return values;
}

const getAllPrototypes = (
	prototypes: Array<[string, any]>, 
	prototypeKey: string = ''
): Map<string, any> => {
	return prototypes
	.reduce<Map<string, any>>((arr, [key, prototype]) => {
		const _key = `${prototypeKey ? `${prototypeKey}\\.` : ''}${key}`
		const _prototype = isClass(prototype) ? prototype.prototype : prototype;

		arr.set(
			_key, 
			prototype
		)

		getAllPrototypes(
			Array.from(
				(Reflect.get(_prototype, classDecorator) ?? new Map())
				.entries()
			),
			_key
		)
		.forEach((value, key) => {
			arr.set(
				key, 
				value
			)
		})
							
		return arr
	}, new Map());
}

export const formLocalToFormData = <T extends Record<string, any>>(
	newForm: T,
	value: State<T>
) => {
	const decoratorsPrototypes: Map<string, any> = Reflect.get(newForm, classDecorator);

	const originalPrototype = Reflect.getPrototypeOf(newForm);
	const newFormValue = deepmerge(newForm, value.form);

	const classsInForm: Array<[RegExp, any]> = Array.from(getAllPrototypes(Array.from(decoratorsPrototypes.entries())))
	.map(([key, prototype]) => [
		new RegExp(
			`^${key.replace(/\[/g, '\\[')
			.replace(/\]/g, '\\]')
			.replace(/\*/g, '.*')}$`
		), 
		prototype
	]);

	const values = getChangedKeys(newFormValue)

	values.forEach(([key, cb]) => {
		const classInForm = classsInForm.find(([keyRegExp]) => keyRegExp.test(key));

		if ( classInForm ) {
			const prototype = classInForm[1];
			cb(isClass(prototype) ? prototype.prototype : prototype)
		}
	})

	return Object.setPrototypeOf(
		newFormValue, 
		originalPrototype
	);
}
