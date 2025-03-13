import { describe, expect, it } from 'vitest';

import { formatErrors } from '../formatErrors';

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
