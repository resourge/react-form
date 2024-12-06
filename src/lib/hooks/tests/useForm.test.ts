import { act } from 'react';

import { renderHook, waitFor } from '@testing-library/react';
import {
	describe,
	it,
	expect,
	vi
} from 'vitest';

import { useForm } from '../useForm';

// Define a basic form type for testing
interface FormData {
	age: number
	name: string
}

describe('useForm', () => {
	const getDefaultValues = (): FormData => ({
		name: '',
		age: 0 
	});

	// Test field function
	it('should return correct field props', () => {
		const { result } = renderHook(() => useForm(getDefaultValues()));

		const fieldProps = result.current.field('name');

		expect(fieldProps).toEqual({
			name: 'name',
			onChange: expect.any(Function),
			value: ''
		});
	});

	// Test getErrors function
	it('should return errors for the form', async () => {
		const { result } = renderHook(() => useForm(getDefaultValues()));

		act(() => {
			result.current.setError([
				{
					path: 'name', 
					errors: ['Name is required']
				}
			]);
		});

		await vi.waitFor(() => {
			expect(result.current.getErrors('name', {
				onlyOnTouch: false 
			})).toEqual(['Name is required']);
		});
	});

	// Test getValue function
	it('should return current value of a specific field', () => {
		const { result } = renderHook(() => useForm(getDefaultValues()));

		act(() => {
			result.current.changeValue('name', 'Jane Doe');
		});

		expect(result.current.getValue('name')).toBe('Jane Doe');
	});

	// Test hasError function
	it('should check if a field has an error', async () => {
		const { result } = renderHook(() => useForm(getDefaultValues()));

		act(() => {
			result.current.setError([
				{
					path: 'name', 
					errors: ['Name is required']
				}
			]);
		});

		await vi.waitFor(() => {		
			expect(result.current.hasError('name', {
				onlyOnTouch: false 
			})).toBe(true);
		});
		expect(result.current.hasError('age', {
			onlyOnTouch: false 
		})).toBe(false);
	});

	// Test onChange function
	it('should update form value on change', () => {
		const { result } = renderHook(() => useForm(getDefaultValues()));

		act(() => {
			result.current.onChange('name')('Jane Doe');
		});

		expect(result.current.form.name).toBe('Jane Doe');
	});

	// Test reset function
	it('should reset', async () => {
		const { result } = renderHook(() => useForm(getDefaultValues()));

		act(() => {
			result.current.changeValue('name', 'Jane Doe');
		});

		await waitFor(() => {
			expect(result.current.form.name).toBe('Jane Doe');
		});

		act(() => {
			result.current.reset({
				name: '',
				age: 10
			});
			
			result.current.triggerChange((form) => {
				form.age = 100;
			});
		});

		await waitFor(() => {
			expect(result.current.form.name).toBe('');
		});
		expect(result.current.form.age).toBe(100);
	});

	// Test resetTouch function
	it('should reset touch state for a field', () => {
		const { result } = renderHook(() => useForm(getDefaultValues()));

		act(() => {
			result.current.changeValue('name', 'Jane Doe');
		});

		act(() => {
			result.current.resetTouch();
		});

		expect(result.current.touches).toEqual({});
	});

	// Test setError function
	it('should set error for a specific field', () => {
		const { result } = renderHook(() => useForm(getDefaultValues()));

		act(() => {
			result.current.setError([
				{
					path: 'name', 
					errors: ['Name is required']
				}
			]);
		});

		expect(result.current.errors).toEqual({
			name: {
				errors: ['Name is required'],
				childErrors: ['Name is required']
			}
		});
	});

	// Test triggerChange function
	it('should trigger change event for a specific field', () => {
		const { result } = renderHook(() => useForm(getDefaultValues()));

		act(() => {
			result.current.triggerChange((form) => form.name = 'Jane Doe');
		});

		expect(result.current.form.name).toBe('Jane Doe');
	});

	// Test watch function
	it('should watch changes to a field', async () => {
		const { result } = renderHook(() => useForm(getDefaultValues()));

		const watchFn = vi.fn();

		act(() => {
			result.current.watch('name', watchFn);
		});

		act(() => {
			result.current.onChange('name')('Jane Doe');
		});

		await vi.waitFor(() => {
			expect(watchFn).toBeCalled();
		});
	});

	it('should initialize with provided values', () => {
		const initialValues = {
			name: 'John',
			age: 30 
		};
		const { result } = renderHook(() => useForm(initialValues));

		expect(result.current.form).toEqual(initialValues);
	});

	it('should change field values correctly', () => {
		const initialValues = {
			name: 'John',
			age: 30 
		};
		const { result } = renderHook(() => useForm(initialValues));

		act(() => {
			result.current.changeValue('name', 'Jane');
		});

		expect(result.current.form.name).toBe('Jane');
	});

	it('should validate fields and set errors', () => {
		const initialValues = {
			name: '',
			age: 30 
		};
		const validate = (values: any) => {
			const errors = [];
			if (!values.name) {
				errors.push({
					path: 'name',
					error: 'Name is required'
				});
			}
			return errors;
		};

		const { result } = renderHook(() => useForm(initialValues, {
			validate,
			validateOnlyAfterFirstSubmit: false
		}));

		act(() => {
			result.current.changeValue('age', 31);
		});

		expect(result.current.errors.name.errors).toContain('Name is required');
	});

	it('should handle form submission', async () => {
		const initialValues = {
			name: 'John',
			age: 30 
		};
		const mockCallback = vi.fn();
		const { result } = renderHook(() => useForm(initialValues));

		await act(async () => {
			await result.current.handleSubmit(mockCallback)();
		});

		expect(mockCallback).toHaveBeenCalledWith(initialValues);
	});

	it('should not submit the form if validation fails', async () => {
		const initialValues = {
			name: '',
			age: 30 
		};
		const validate = (values: any) => {
			const errors = [];
			if (!values.name) {
				errors.push({
					path: 'name',
					error: 'Name is required'
				});
			}
			return errors;
		};
		const mockCallback = vi.fn();
		const { result } = renderHook(() => useForm(initialValues, {
			validate 
		}));

		await act(async () => {
			try {
				await result.current.handleSubmit(mockCallback)();
			}
			catch {}
		});

		expect(mockCallback).not.toHaveBeenCalled();

		await vi.waitFor(() => {
			expect(result.current.errors.name.errors).toContain('Name is required');
		});
	});

	it('should handle field changes correctly', () => {
		const initialForm = {
			name: 'John',
			age: 30 
		};
		const { result } = renderHook(() => useForm(initialForm));

		// Change field value
		act(() => {
			result.current.changeValue('name', 'Jane');
		});

		// Verify the form state
		expect(result.current.form.name).toBe('Jane');
	});

	it('should validate form and set errors', async () => {
		const initialForm = {
			name: 'John',
			age: 30 
		};
		// Set up mock validation
		const mockValidation = vi.fn(() => {
			return [
				{
					error: 'Name is required',
					path: 'name'
				}
			];
		});

		const { result } = renderHook(() => useForm(
			initialForm, 
			{
				validate: mockValidation,
				validateOnlyAfterFirstSubmit: false
			}
		));

		// Trigger form validation
		act(() => {
			result.current.triggerChange((form) => {
				form.name = 'Jon';
			});
		});

		await waitFor(() => {
		// Verify if errors are set
			expect(result.current.errors.name.errors).toContain('Name is required');
		});
	});
});
