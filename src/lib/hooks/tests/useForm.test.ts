import { act } from 'react';

import { renderHook } from '@testing-library/react';
import {
	describe,
	expect,
	it,
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

	describe('array', () => {
		describe('onSubmit validation', () => {
			it('should mark an array field as touched only after submit', async () => {
				const { result } = renderHook(() => 
					useForm({
						array: [] as number[]
					}, {
						validationType: 'onSubmit' 
					})
				);
	
				act(() => result.current.form.array.push(1));
				expect(result.current.hasTouch('array[0]')).toBeFalsy();

				act(() => result.current.form.array[0] = 10);
				expect(result.current.hasTouch('array[0]')).toBeFalsy();

				await act(() => result.current.handleSubmit(() => {})());
				expect(result.current.hasTouch('array[0]')).toBeTruthy();

				act(() => result.current.form.array.push(1));
				expect(result.current.form.array.length).toBe(2);
				expect(result.current.hasTouch('array[1]')).toBeFalsy();
			});

			it('should track touch state correctly for multiple elements', async () => {
				const { result } = renderHook(() =>
					useForm({
						array: [3, 2, 1, 5] as number[] 
					}, {
						validationType: 'onSubmit' 
					})
				);
	
				[0, 1, 2, 3].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeFalsy());
	
				await act(() => result.current.handleSubmit(() => {})());
				[0, 1, 2, 3].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());

				act(() => result.current.form.array.push(0));
				[0, 1, 2].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());
				expect(result.current.hasTouch('array[4]')).toBeFalsy();
				
				act(() => result.current.form.array.reverse());
				expect(result.current.hasTouch('array[0]')).toBeFalsy();
				[1, 2, 3, 4].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());
				
				act(() => result.current.form.array.fill(0, 0, 5));
				[0, 1, 2, 3, 4].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeFalsy());
				
				await act(() => result.current.handleSubmit(() => {})());
				[0, 1, 2, 3, 4].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());

				act(() => result.current.form.array.pop());
				act(() => result.current.form.array.push(1));
				[0, 1, 2, 3].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());
				expect(result.current.hasTouch('array[4]')).toBeFalsy();

				act(() => result.current.form.array.shift());
				act(() => result.current.form.array.push(2));
				[0, 1, 2].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());
				expect(result.current.hasTouch('array[3]')).toBeFalsy();
				expect(result.current.hasTouch('array[4]')).toBeFalsy();

				act(() => result.current.form.array.unshift(3));

				expect(result.current.hasTouch('array[0]')).toBeFalsy();
				[1, 2, 3].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());
				expect(result.current.hasTouch('array[4]')).toBeFalsy();
				expect(result.current.hasTouch('array[5]')).toBeFalsy();

				act(() => result.current.form.array.splice(1, 0, 4, 5));
				expect(result.current.hasTouch('array[0]')).toBeFalsy();
				expect(result.current.hasTouch('array[1]')).toBeFalsy();
				expect(result.current.hasTouch('array[2]')).toBeFalsy();
				expect(result.current.hasTouch('array[3]')).toBeTruthy();
				expect(result.current.hasTouch('array[4]')).toBeTruthy();
				expect(result.current.hasTouch('array[5]')).toBeTruthy();
				expect(result.current.hasTouch('array[6]')).toBeFalsy();
				expect(result.current.hasTouch('array[7]')).toBeFalsy();

				// Array   [3, 4, 5, 0, 0, 0, 1, 2]
				// Touches [false, false, false, true, true, true, false, false]
				act(() => result.current.form.array.sort((a, b) => a - b));
				[0, 1, 2].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());
				[3, 4, 5, 6, 7].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeFalsy());

				act(() => result.current.form.array = result.current.form.array.map((a) => a));
				[0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeFalsy());

				act(() => {
					result.current.form.array = result.current.form.array
					.sort((a, b) => a - b)
					.map((a) => a);
				});

				[0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeFalsy());
			});

			it('should track touch state correctly for multiple elements (object array)', async () => {
				const { result } = renderHook(() =>
					useForm(
						{
							array: [
								{
									id: 1,
									value: 'A' 
								},
								{
									id: 2,
									value: 'B' 
								},
								{
									id: 3,
									value: 'C' 
								},
								{
									id: 4,
									value: 'D' 
								}
							] as Array<{ id: number
								value: string }>
						},
						{
							validationType: 'onSubmit'
						}
					)
				);
			
				[0, 1, 2, 3].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeFalsy());
			
				await act(() => result.current.handleSubmit(() => {})());
				[0, 1, 2, 3].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());
			
				act(() => result.current.form.array.push({
					id: 5,
					value: 'E' 
				}));
				[0, 1, 2, 3].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());
				expect(result.current.hasTouch('array[4]')).toBeFalsy();
			
				act(() => result.current.form.array.reverse());
				expect(result.current.hasTouch('array[0]')).toBeFalsy();
				[1, 2, 3, 4].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());
			
				act(() => {
					result.current.form.array.fill({
						id: 6,
						value: 'F' 
					}, 0, 5);
					// This because in jest for some reason works different from browser
					/* result.current.form.array = result.current.form.array.map(() => ({
						id: 6,
						value: 'F' 
					})); */
				});
				[0, 1, 2, 3, 4].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeFalsy());
			
				await act(() => result.current.handleSubmit(() => {})());
				[0, 1, 2, 3, 4].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());
			
				act(() => result.current.form.array.pop());
				act(() => result.current.form.array.push({
					id: 7,
					value: 'G' 
				}));
				[0, 1, 2, 3].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());
				expect(result.current.hasTouch('array[4]')).toBeFalsy();
			
				act(() => result.current.form.array.shift());
				act(() => result.current.form.array.push({
					id: 8,
					value: 'H' 
				}));
				[0, 1, 2].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());
				expect(result.current.hasTouch('array[3]')).toBeFalsy();
				expect(result.current.hasTouch('array[4]')).toBeFalsy();
			
				act(() => result.current.form.array.unshift({
					id: 9,
					value: 'I' 
				}));
				expect(result.current.hasTouch('array[0]')).toBeFalsy();
				[1, 2, 3].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());
				expect(result.current.hasTouch('array[4]')).toBeFalsy();
				expect(result.current.hasTouch('array[5]')).toBeFalsy();
			
				act(() => result.current.form.array.splice(1, 0, {
					id: 10,
					value: 'J' 
				}, {
					id: 11,
					value: 'K' 
				}));
				expect(result.current.hasTouch('array[0]')).toBeFalsy();
				expect(result.current.hasTouch('array[1]')).toBeFalsy();
				expect(result.current.hasTouch('array[2]')).toBeFalsy();
				expect(result.current.hasTouch('array[3]')).toBeTruthy();
				expect(result.current.hasTouch('array[4]')).toBeTruthy();
				expect(result.current.hasTouch('array[5]')).toBeTruthy();
				expect(result.current.hasTouch('array[6]')).toBeFalsy();
				expect(result.current.hasTouch('array[7]')).toBeFalsy();
			
				act(() => result.current.form.array.sort((a, b) => a.id - b.id));
		
				[0, 1, 2].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeTruthy());
				[3, 4, 5, 6, 7].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeFalsy());
			
				act(() => (result.current.form.array = result.current.form.array.map((a) => ({
					...a 
				}))));
				[0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeFalsy());
			
				act(() => {
					result.current.form.array = result.current.form.array.sort((a, b) => a.id - b.id).map((a) => ({
						...a 
					}));
				});
			
				[0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => expect(result.current.hasTouch(`array[${i}]`)).toBeFalsy());
			});
		});
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

	it('should form be valid only after onSubmit', async () => {
		const { result } = renderHook(() => useForm(
			getDefaultValues(), 
			{
				validate: () => [{
					path: 'name',
					error: 'Required'
				}]
			}
		));

		expect(result.current.isValid).toBeTruthy();

		await act(() => (result.current.handleSubmit(() => {})()).catch(() => []));

		expect(result.current.isValid).toBeFalsy();
	});

	it('should validate in first render', () => {
		const initialForm = {
			name: 'John',
			age: 30 
		};
		const { result } = renderHook(() => useForm(initialForm, {
			validate: () => {
				return [
					{
						path: 'name',
						error: 'Min 5'
					}
				];
			},
			validationType: 'always'
		}));

		expect(result.current.hasError('name')).toBeTruthy();
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
			expect(result.current.getErrors('name')).toEqual(['Name is required']);
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
			expect(result.current.hasError('name')).toBe(true);
		});
		expect(result.current.hasError('age')).toBe(false);
	});

	// Test onChange function
	it('should update form value on change', () => {
		const { result } = renderHook(() => useForm(getDefaultValues()));

		act(() => {
			result.current.changeValue('name', 'Jane Doe');
		});

		expect(result.current.form.name).toBe('Jane Doe');
	});

	// Test reset function
	it('should reset', () => {
		const { result } = renderHook(() => useForm(getDefaultValues(), {
			validationType: 'onTouch'
		}));

		act(() => {
			result.current.changeValue('name', 'Jane Doe');
		});

		expect(result.current.form.name).toBe('Jane Doe');

		act(() => {
			result.current.reset({
				name: '',
				age: 10
			});
		});

		expect(result.current.hasTouch('age')).toBeFalsy();

		act(() => {
			result.current.form.age = 100;
		});
		
		expect(result.current.hasTouch('age')).toBeTruthy();

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

		expect(result.current.hasTouch('name')).toBeFalsy();
	});

	// Test setError function
	it('should set error for a specific field', () => {
		const { result } = renderHook(() => useForm(getDefaultValues()));

		expect(result.current.errors.name).toBeUndefined();

		act(() => {
			result.current.setError([
				{
					path: 'name', 
					errors: ['Name is required']
				}
			]);
		});

		expect(result.current.errors.name?.form.errors).toEqual(['Name is required']);
		expect(result.current.errors.name?.form.child).toEqual(['Name is required']);
	});

	// Test watch function
	it('should watch changes to a field', async () => {
		const watchFn = vi.fn();

		const { result } = renderHook(() => {
			return useForm(getDefaultValues(), {
				watch: {
					name: watchFn
				} 
			});
		});

		act(() => {
			result.current.changeValue('name', 'Jane Doe');
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
			expect(result.current.errors.name?.form.errors).toContain('Name is required');
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
});
