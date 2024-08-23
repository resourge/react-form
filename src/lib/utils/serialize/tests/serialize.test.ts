import { expect, test } from 'vitest';

import { deserialize, registerClass } from '../deserialize';
import { serialize } from '../serialize';

export class Test {
	qwe = 10;
	tryt = undefined;
	gg() {}
	// ggq = () => {};
}

registerClass(Test);

const serializableObj = {
	date: new Date(),
	testClass: new Test(),
	set: new Set([10, new Test()]),
	arr: [new Test(), 10, new Test(), new Test()],
	map: new Map([['Q1', new Map([['Q', new Test()]])]]),
	undefinedValue: undefined,
	url: new URL('/test', window.location.origin),
	// eslint-disable-next-line prefer-regex-literals
	regExp: new RegExp(/test({})/, 'g'),
	error: new Error('Test'),
	// fg: Bob,
	bigArray: Array.from(
		{
			length: 10000
		},
		() => new Test()
	)
};

test('serialize and deserialize', () => {
	const _serializableObj = serialize({
		...serializableObj 
	});

	expect(deserialize(_serializableObj)).toEqual(serializableObj);
});
