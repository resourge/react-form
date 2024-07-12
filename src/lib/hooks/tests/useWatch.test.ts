import { act } from 'react';

import { renderHook } from '@testing-library/react';
import {
	describe,
	it,
	expect,
	vi
} from 'vitest';

import { type FormKey } from 'src/lib/types';

import { useWatch } from '../useWatch';

// Sample form interface for testing
interface FormType {
	age: number
	name: string
}

describe('useWatch', () => {
	it('should add and execute watch methods correctly', async () => {
		const { result } = renderHook(() => useWatch<FormType>());

		// Set up mock methods
		const mockMethod = vi.fn();

		// Add a watch for 'name' key
		act(() => {
			result.current.watch('name', mockMethod);
		});

		// Simulate form change
		const form = {
			name: 'John',
			age: 30 
		};
		const changedKeys = {
			current: new Set<FormKey<FormType>>(['name']) 
		};
    
		// Trigger onWatch method
		act(() => {
			result.current.onWatch.current(form, changedKeys);
		});

		await vi.waitFor(() => {
			// Verify if the mock method was called
			expect(mockMethod).toHaveBeenCalledWith(form);
		});
	});

	it('should handle submit watch methods', async () => {
		const { result } = renderHook(() => useWatch<FormType>());

		// Set up mock submit method
		const mockSubmitMethod = vi.fn();

		// Add a watch for 'submit'
		act(() => {
			// @ts-expect-error expected
			result.current.watch('submit', mockSubmitMethod);
		});

		// Simulate form submit
		const form = {
			name: 'John',
			age: 30 
		};

		await act(async () => {
			await result.current.onSubmitWatch.current()(form);
		});

		// Verify if the mock submit method was called
		expect(mockSubmitMethod).toHaveBeenCalledWith(form);
	});

	it('should correctly determine if watching keys are present', () => {
		const { result } = renderHook(() => useWatch<FormType>());

		// Set up mock methods
		const mockMethod = vi.fn();

		// Add a watch for 'name' key
		act(() => {
			result.current.watch('name', mockMethod);
		});

		// Simulate changed keys
		const changedKeys = {
			current: new Set<FormKey<FormType>>(['name']) 
		};

		// Check if has watching keys
		const hasKeys = result.current.hasWatchingKeys(changedKeys);
		expect(hasKeys).toBe(true);
	});
});
