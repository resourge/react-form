import { describe, it, expect } from 'vitest';

import { shallowClone } from '../shallowClone';

class Products {
	public categories: string[] = [];

	constructor (
		public productId: number,
		public productName: string
	) {

	}

	public getProductId() {
		return this.productId;
	}
}

describe('shallow clone', () => {
	it('test array', () => {
		const array: any[] = [];
		const array2: any[] = array;

		const newArray = shallowClone(array);

		array.push(1);
		array2.push(2);
		newArray.push(3);

		expect(array === array2).toBeTruthy();
		expect(array === newArray).toBeFalsy();
		expect(newArray === array2).toBeFalsy();
	});

	it('test object', () => {
		const object: Record<string, any> = { };
		const object2: Record<string, any> = object;

		const newObject = shallowClone(object);

		object.Bar = 'Bar';
		object2.foo = 'foo';
		newObject.product = 'product';

		expect(object === object2).toBeTruthy();
		expect(object === newObject).toBeFalsy();
		expect(newObject === object2).toBeFalsy();
	});

	it('test class', () => {
		const classProducts = new Products(1, 'Apple');
		const classProducts2 = classProducts;

		const newClassProducts = shallowClone(classProducts);

		classProducts.productId = 2;
		classProducts2.productName = 'Orange';
		newClassProducts.productId = 3;

		expect(newClassProducts.getProductId).not.toBeUndefined();

		expect(classProducts === classProducts2).toBeTruthy();
		expect(classProducts === newClassProducts).toBeFalsy();
		expect(newClassProducts === classProducts2).toBeFalsy();

		expect(classProducts.productId).toBe(2);
		expect(classProducts2.productId).toBe(2);
		expect(classProducts.productName).toBe('Orange');
		expect(classProducts2.productName).toBe('Orange');
		expect(newClassProducts.productId).toBe(3);
		expect(newClassProducts.productName).toBe('Apple');
	});

	it('should test symbol', () => {
		expect(
			shallowClone(
				Object.freeze({
					[Symbol('test')]: true
				})
			)
		)
		.toMatchObject({
			[Symbol('test')]: true
		});
	});

	it('should test object', () => {
		expect(
			shallowClone(
				{
					get productName() {
						return 'productName';
					},
					set productName(_productName: string) {
						
					}
				}
			)
		)
		.toMatchObject({
			productName: 'productName'
		});
	});
});
