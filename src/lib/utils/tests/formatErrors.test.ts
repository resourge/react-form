import {
	describe,
	expect,
	it,
	vi
} from 'vitest';

import { forEachPossibleKey } from '../formatErrors';

describe('forEachPossibleKey', () => {
	it('should return all key possibilities in reverse order', () => {
		const possibilities: string[] = [];
		
		forEachPossibleKey('a.b[0].c.d', (key) => possibilities.push(key));

		expect(possibilities).toEqual(['a.b[0].c.d', 'a.b[0].c', 'a.b[0]', 'a.b', 'a', '']);
	});

	it('should call the callback for each key', () => {
		const callback = vi.fn();
		forEachPossibleKey('x.y[2].z', callback);
		expect(callback).toHaveBeenCalledTimes(5);
		expect(callback).toHaveBeenCalledWith('x.y[2].z');
		expect(callback).toHaveBeenCalledWith('x.y[2]');
		expect(callback).toHaveBeenCalledWith('x.y');
		expect(callback).toHaveBeenCalledWith('x');
		expect(callback).toHaveBeenCalledWith('');
	});

	it('should return an empty array for an empty string', () => {
		const possibilities: string[] = [];
		
		forEachPossibleKey('', (key) => possibilities.push(key));

		expect(possibilities)
		.toEqual(['']);
	});
});
