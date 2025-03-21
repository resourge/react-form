import { type FormOptions, type UseFormReturn } from '../types/formTypes';
import { type FormCoreConfig } from '../utils/createFormCore';

import { useFormCore } from './useFormCore';
import { useTouches } from './useTouches';

/**
 * @example
 * ```tsx
 * import { useForm } from "@resourge/react-form";
 * 
 * const MyForm = () => {
 *   const { form, handleSubmit, field, hasError, getErrors } = useForm({
 *     username: "",
 *     password: "",
 *     products: Array.from(
 *       {
 *         length: 100,
 *       },
 *       (_, i) => ({ productId: i + 1 })
 *     ),
 *     getProducts() {
 *       return this.products.map(({ productId }) => productId);
 *     },
 *   });
 * 
 *   // Methods used in render will have the return cached (cache expires when camps used or parameters change).
 *   const productIds = form.getProducts();
 * 
 *   const onSubmit = handleSubmit((data) => console.log("Form Submitted:", data));
 * 
 *   return (
 *     <form onSubmit={onSubmit}>
 *       <input {...field("username")} placeholder="Username" />
 *       {hasError("username") && <span>{getErrors("username")[0]}</span>}
 * 
 *       <input {...field("password")} placeholder="Password" type="password" />
 *       {hasError("password") && <span>{getErrors("password")[0]}</span>}
 * 
 *       <button type="submit">Submit</button>
 *     </form>
 *   );
 * };
 * ```
 */
export function useForm<T extends Record<string, any>>(
	defaultValue: new() => T, 
	formOptions?: FormOptions<T>
): UseFormReturn<T>;
export function useForm<T extends Record<string, any>>(
	defaultValue: () => T, 
	formOptions?: FormOptions<T>
): UseFormReturn<T>;
export function useForm<T extends Record<string, any>>(
	defaultValue: T, 
	formOptions?: FormOptions<T>
): UseFormReturn<T>;
export function useForm<T extends Record<string, any>>(
	defaultValue: T | (() => T) | ((new() => T)), 
	formOptions: FormOptions<T> = {}
): UseFormReturn<T> {
	return useFormCore<T>({
		context: {
			touchHook: useTouches<T>(formOptions.validationType),
			formOptions
		} as unknown as FormCoreConfig<T, 'form'>['context'],
		defaultValue,
		type: 'form'
	});
}
