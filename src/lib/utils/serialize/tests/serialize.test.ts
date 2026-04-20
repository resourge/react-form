import { expect, test } from 'vitest';

import { deserialize, registerClass } from '../deserialize';
import { serialize } from '../serialize';

export class Test {
	qwe = 10;
	tryt = undefined;
	gg() { }
	// ggq = () => {};
}

registerClass(Test);

const serializableObj = {
	arr: [new Test(), 10, new Test(), new Test()],
	// fg: Bob,
	bigArray: Array.from(
		{
			length: 10_000
		},
		() => new Test()
	),
	date: new Date(),
	error: new Error('Test'),
	map: new Map([['Q1', new Map([['Q', new Test()]])]]),

	regExp: new RegExp(/test({})/, 'g'),
	set: new Set([10, new Test()]),
	testClass: new Test(),
	undefinedValue: undefined,
	url: new URL('/test', globalThis.location.origin)
};

test('serialize and deserialize', () => {
	const _serializableObj = serialize({
		...serializableObj
	});

	expect(deserialize(_serializableObj)).toEqual(serializableObj);
});
