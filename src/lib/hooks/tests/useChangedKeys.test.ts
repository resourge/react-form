import { act } from 'react';

import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useChangedKeys } from '../useChangedKeys';

describe('useChangedKeys', () => {
	it('should return an empty set if no values have changed', () => {
		const { result } = renderHook(() => useChangedKeys({}));

		expect(result.current[0].current.size).toBe(0);
	});

	it('should return changed keys correctly', () => {
		const { result } = renderHook(() => useChangedKeys({}));

		act(() => {
			result.current[1]('name');
		});

		expect(result.current[0].current.has('name')).toBe(true);
		expect(result.current[0].current.has('age')).toBe(false);
	});

	it('should return all changed keys', () => {
		const { result } = renderHook(() => useChangedKeys({}));

		act(() => {
			result.current[1]('name');
		});

		act(() => {
			result.current[1]('age');
		});

		act(() => {
			result.current[1]('email');
		});

		expect(result.current[0].current.has('name')).toBe(true);
		expect(result.current[0].current.has('age')).toBe(true);
		expect(result.current[0].current.has('email')).toBe(true);
	});

	it('should return changed keys when current values are updated', () => {
		const { result, rerender } = renderHook(() => useChangedKeys({}));

		// Initial check
		expect(result.current[0].current.size).toBe(0);

		act(() => {
			result.current[1]('name');
		});

		expect(result.current[0].current.has('name')).toBe(true);
		expect(result.current[0].current.has('age')).toBe(false);

		// Update current values
		rerender({
			name: true,
			age: false
		});

		// re check
		expect(result.current[0].current.size).toBe(0);
	});
});
