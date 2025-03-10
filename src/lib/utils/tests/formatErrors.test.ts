import {
	describe,
	expect,
	it,
	vi
} from 'vitest';

import { forEachPossibleKey, formatErrors } from '../formatErrors';

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

describe('formatErrors', () => {
	it('should return all key possibilities in reverse order', () => {
		const result = formatErrors([
			{
				error: 'validations.required',
				path: 'description'
			},
			{
				error: 'promptModel.promptIsRequired',
				path: 'nodes[0].data.prompt.content'
			}
		]);

		expect(JSON.parse(JSON.stringify(result['']?.formErrors))).toEqual({
			description: {
				every: {
					errors: [
						'validations.required'
					],
					child: [
						'validations.required'
					]
				},
				form: {
					errors: [
						'validations.required'
					],
					child: [
						'validations.required'
					]
				}
			},
			'nodes[0].data.prompt.content': {
				every: {
					errors: [
						'promptModel.promptIsRequired'
					],
					child: [
						'promptModel.promptIsRequired'
					]
				},
				form: {
					errors: [
						'promptModel.promptIsRequired'
					],
					child: [
						'promptModel.promptIsRequired'
					]
				}
			},
			'nodes[0].data.prompt': {
				every: {
					errors: [],
					child: [
						'promptModel.promptIsRequired'
					]
				},
				form: {
					errors: [],
					child: [
						'promptModel.promptIsRequired'
					]
				}
			},
			'nodes[0].data': {
				every: {
					errors: [],
					child: [
						'promptModel.promptIsRequired'
					]
				},
				form: {
					errors: [],
					child: [
						'promptModel.promptIsRequired'
					]
				}
			},
			'nodes[0]': {
				every: {
					errors: [],
					child: [
						'promptModel.promptIsRequired'
					]
				},
				form: {
					errors: [],
					child: [
						'promptModel.promptIsRequired'
					]
				}
			},
			nodes: {
				every: {
					errors: [],
					child: [
						'promptModel.promptIsRequired'
					]
				},
				form: {
					errors: [],
					child: [
						'promptModel.promptIsRequired'
					]
				}
			}
		});
	});
});
