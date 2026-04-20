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

		expect(structuredClone(result['']?.formErrors)).toEqual({
			'description': {
				every: {
					child: [
						'validations.required'
					],
					errors: [
						'validations.required'
					]
				},
				form: {
					child: [
						'validations.required'
					],
					errors: [
						'validations.required'
					]
				}
			},
			'nodes': {
				every: {
					child: [
						'promptModel.promptIsRequired'
					],
					errors: []
				},
				form: {
					child: [
						'promptModel.promptIsRequired'
					],
					errors: []
				}
			},
			'nodes[0]': {
				every: {
					child: [
						'promptModel.promptIsRequired'
					],
					errors: []
				},
				form: {
					child: [
						'promptModel.promptIsRequired'
					],
					errors: []
				}
			},
			'nodes[0].data': {
				every: {
					child: [
						'promptModel.promptIsRequired'
					],
					errors: []
				},
				form: {
					child: [
						'promptModel.promptIsRequired'
					],
					errors: []
				}
			},
			'nodes[0].data.prompt': {
				every: {
					child: [
						'promptModel.promptIsRequired'
					],
					errors: []
				},
				form: {
					child: [
						'promptModel.promptIsRequired'
					],
					errors: []
				}
			},
			'nodes[0].data.prompt.content': {
				every: {
					child: [
						'promptModel.promptIsRequired'
					],
					errors: [
						'promptModel.promptIsRequired'
					]
				},
				form: {
					child: [
						'promptModel.promptIsRequired'
					],
					errors: [
						'promptModel.promptIsRequired'
					]
				}
			}
		});
	});
});
