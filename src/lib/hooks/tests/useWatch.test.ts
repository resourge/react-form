import { act } from 'react';

import { renderHook } from '@testing-library/react';
import {
	describe,
	expect,
	it,
	vi
} from 'vitest';

import { useWatch } from '../useWatch';

// Sample form interface for testing
interface FormType {
	age: number
	name: string
}

describe('useWatch', () => {
	it('should handle submit watch methods', async () => {
		const { result } = renderHook(() => useWatch<FormType>());

		// Set up mock submit method
		const mockSubmitMethod = vi.fn();

		// Add a watch for 'submit'
		act(() => {
			result.current.watch('submit', mockSubmitMethod);
		});

		// Simulate form submit
		const form = {
			name: 'John',
			age: 30 
		};

		await act(async () => {
			await result.current.onSubmitWatch(form);
		});

		// Verify if the mock submit method was called
		expect(mockSubmitMethod).toHaveBeenCalledWith(form);
	});
});
