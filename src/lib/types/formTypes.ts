/* eslint-disable @typescript-eslint/no-invalid-void-type */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type FormEvent } from 'react';

import { type FormKey } from './FormKey';
import { type ValidationErrors } from './errorsTypes';
import { type FormCoreOptions } from './types';

export type ToucheType = {
	submitted: boolean
	touch: boolean
};

export type Touches = Map<any, ToucheType>;

export type FormError<T extends Record<string, any>> = {
	every: {
		/**
		 * Child Errors, includes repeating
		 */
		child: string[]
		/**
		 * Errors, includes repeating
		 */
		errors: string[]
	}
	form: {
		/**
		 * Child Errors, doesn't include repeating
		 */
		child: string[]
		/**
		 * Errors, doesn't include repeating
		 */
		errors: string[]
	}
	formErrors: FormErrors<T>
};

export type FormErrors<T extends Record<string, any>> = {
	[K in FormKey<T>]?: FormError<T[K]>
};

export type ErrorsOptions = {
	/**
	 * Includes the children errors on the array (@default false)
	 */
	includeChildsIntoArray?: boolean
};

export type GetErrorsOptions = ErrorsOptions & {
	/**
	 * Filters repeating errors
	 * @default true
	 */
	unique?: boolean
};

export type ResetMethod<T extends Record<string, any>> = (newFrom: Partial<T>, resetOptions?: ResetOptions | undefined) => void;

export type FormValidationType = 'onSubmit' | 'always' | 'onTouch';

export type FormOptions<T extends Record<string, any>> = {
	/**
	 * Triggers when form is changed
	 */
	onChange?: (form: T) => Promise<void> | void
	/**
	 * Triggers when form is submitted
	 */
	onSubmit?: (form: T) => Promise<void> | void
	/**
	 * Method to validate form.
	 * Usually with some kind of validator.
	 * 
	 * @expects - to throw the errors, 
	 * 	so either `onError` or default method for `onError` {@link setDefaultOnError} can catch then 
	 * @param form - form state
	 * @example 
	 * ```Typescript
	 * const { ... } = useForm(
	 *	 {
	 * 		name: 'Rimuru'
	 *	 },
	 *   {
	 * 		validate: (form) => {
	 * 			throw new Error()
	 * 		}
	 * 	 }
	 * )
	 * ```
	 */
	validate?: (form: T, changedKeys: Array<FormKey<T>>) => void | Promise<void> | ValidationErrors | Promise<ValidationErrors>
	/**
	 * Validation type, specifies the type of validation.
	 * @default 'onSubmit'
	 */
	validationType?: FormValidationType

	/**
	 * Triggered when a specified key changes. Useful for updating dependent data, especially in asynchronous scenarios (e.g., fetching async data).
	 */
	watch?: { [K in FormKey<T>]?: (form: T) => Promise<void> | void }
};

export type FieldFormBlur<Value = any, Name = string> = {
	/**
	 * Form value
	 */
	defaultValue: Value
	/**
	 * Attribute `name`
	 */
	name: Name
	/**
	 * Method to update values
	 */
	onBlur: (value: Value) => void
	/**
	 * When true onChange will not be returned
	 */
	readOnly?: boolean
};

export type FieldFormReadonly<Value = any, Name = string> = {
	/**
	 * Attribute `name`
	 */
	name: Name
	/**
	 * Form value
	 */
	value: Value
	/**
	 * When true onChange will not be returned
	 */
	readOnly?: boolean
};

export type FieldFormChange<Value = any, Name = string> = {
	/**
	 * Attribute `name`
	 */
	name: Name
	/**
	 * Method to update values
	 */
	onChange: (value: Value) => void
	/**
	 * Form value
	 */
	value: Value
	/**
	 * When true onChange will not be returned
	 */
	readOnly?: boolean
};

export type FieldForm<T extends Record<string, any>> = {
	(key: FormKey<T>, options: FieldOptions & { blur: true }): FieldFormBlur
	(key: FormKey<T>, options: FieldOptions & { readonly: true }): FieldFormReadonly
	(key: FormKey<T>, options?: FieldOptions): FieldFormChange
};

export type GetErrors<T extends Record<string, any>> = (
	key: FormKey<T>, 
	options?: GetErrorsOptions
) => string[];

export type FieldFormReturn<Value = any, Name = string> = FieldFormReadonly<Value, Name> | FieldFormBlur<Value, Name> | FieldFormChange<Value, Name>;

export type ResetOptions = {
	/**
	 * On reset, `touches` will be cleared
	 * 
	 * @default true
	 */
	clearTouched?: boolean
};

export type FieldOptions = {
	/**
	 * Turns the field from a onChange to onBlur
	 */
	blur?: boolean
	/**
	 * For cases where the onChange value needs to be different
	 */
	onChange?: (value: any) => any
	/**
	 * Disables `onChange` method
	 */
	readOnly?: boolean
};

export type OnFunctionChange<T extends Record<string, any>, Result = void> = ((form: T) => Result) | ((form: T) => Promise<Result>);

export type SubmitHandler<T extends Record<string, any>, K = void> = (form: T) => K | Promise<K>;

export type ValidateSubmissionErrors = (newErrors: ValidationErrors) => ValidationErrors | boolean | Promise<ValidationErrors | boolean>;

export type FormTypes = 'form' | 'formSplitter';

export type FormContextType<T extends Record<string, any>, FT extends FormTypes = 'form'> = {
	changedKeys: Array<FormKey<T>>
	formState: UseFormReturn<T, FT>
	options: FormCoreOptions<T>
	toJSON: () => object
	type: FT
};

export type UseFormReturn<T extends Record<string, any>, FT extends FormTypes = 'form'> = {
	/**
	 * Simplified version of `onChange`, without the return method
	 * 
	 * @param key - key from `form` state
	 * @param value - value for the param `key`
	 * @example 
	 * ```Typescript
	 * const {
	 *   changeValue
	 * } = useForm(
	 *	 {
	 * 		name: 'Rimuru',
	 * 		age: '40'
	 *	 }
	 * )
	 * ...
	 * changeValue('name', 'Rimuru Tempest')
	 * 
	 * /// Validates form on change
	 * changeValue('name', 'Rimuru Tempest', { validate: true })
	 * ```
	 */
	changeValue: (key: FormKey<T>, value: T[FormKey<T>]) => void
	/**
	 * Context mainly for use in `FormProvider/Controller`, basically returns {@link UseFormReturn}
	 */
	context: FormContextType<T, FT>
	/**
	 * Form errors
	 * * Note: Depends on {@link FormOptions#validate}.
	 */
	errors: FormErrors<T>
	/**
	 * Method to connect the form element to the key, by providing native attributes like `onChange`, `name`, etc
	 * 
	 * @param key - key from `form` state
	 * @param options - {@link FieldOptions}
	 * @returns - native attributes like `onChange`, `name`, `value`, `readOnly`, etc
	 * @example
	 * ```Typescript
	 * const {
	 *   field
	 * } = useForm(
	 *	 {
	 *		 name: 'Rimuru'
	 *	 }
	 * )
	 * ...
	 * <input {...field('name')} />
	 * 
	 * /// For validating on change
	 * <input {...field('name', { validate: true })} />
	 * ...
	 * ```
	 */
	field: FieldForm<T>
	/**
	 * Form state
	 */
	form: T
	/**
	 * Returns error messages for the matched key
	 * 
	 * @param key - key from `form` state
	 * @param options - {@link GetErrorsOptions}
	 * @returns - matched key error messages
	 * @example
	 * ```Typescript
	 * const {
	 *   getErrors
	 * } = useForm(
	 *	 {
	 * 		product: {
	 *			name: 'Apple',
	 *			category: {
	 *				name: 'Food',
	 *				type: {
	 * 					name: 'Solid',
	 * 					type: 'Vegetal'
	 * 				}
	 * 			}
	 * 		}
	 *	 }
	 * )
	 * ...
	 * getErrors('product.category') /// [<<Error Messages>>]
	 * ///
	 * ```
	 */
	getErrors: GetErrors<T>
	/**
	 * Return the value for the matched key
	 * 
	 * @param key - key from `form` state
	 * @returns - value for the param `key`
	 * @example 
	 * ```Typescript
	 * const {
	 *	 changeValue
	 * } = useForm(
	 *	 {
	 * 		name: 'Rimuru'
	 *	 }
	 * )
	 * ...
	 * getValue('name') /// Rimuru
	 * ```
	 */
	getValue: (key: FormKey<T>) => any
	/**
	 * Method to handle form submission
	 * 
	 * @param onValid - on a valid `form`, this method will be triggered
	 * @param validateErrors - A method that allows to control which validation errors 
 	 *                         are considered acceptable for this specific `handleSubmit` call.
 	 *                         This enables dynamic error handling based on the context of submission.
	 * @example
	 * ```Typescript
	 * ...
	 * const onSubmit = handleSubmit((form) => {
	 * 		/// On `onSubmit` it will only call when form is valid
	 * 		/// do something with it
	 * })
	 * 
	 * const onSubmit = handleSubmit(
	 * 		(form) => {
	 * 			/// On `onSubmit` will always be called because the next method return true
	 * 			/// do something with it
	 * 		},
	 *     (errors) => errors // Custom validation logic determining acceptable errors.
	 * )
	 * ...
	 * ```
	 */
	handleSubmit: <K = void>(
		onValid: SubmitHandler<T, K>, 
		validateErrors?: ValidateSubmissionErrors
	) => (e?: FormEvent<HTMLFormElement> | React.MouseEvent<any, React.MouseEvent> | React.BaseSyntheticEvent) => Promise<K | undefined>
	/**
	 * Method to verify if `key` has errors
	 * 
	 * @param key - key from `form` state
	 * @param options - {@link ErrorsOptions}
	 * @returns `true` for error on form
	 * @example
	 * ```Typescript
	 * const {
	 *   hasError
	 * } = useForm(
	 *	 {
	 * 		name: 'Rimuru'
	 *	 }
	 * )
	 * ...
	 * hasError('name')
	 * ///
	 * ```
	 */
	hasError: (key: FormKey<T>, options?: ErrorsOptions) => boolean
	/**
	 * Method to verify if `key` has being 'touched'
	 * 
	 * @param key - key from `form` state
	 * @returns `true` for touch on field
	 * @example
	 * ```Typescript
	 * const {
	 *   hasTouch
	 * } = useForm(
	 *	 {
	 * 		name: 'Rimuru'
	 *	 }
	 * )
	 * ...
	 * hasTouch('name')
	 * ///
	 * ```
	 */
	hasTouch: (key: FormKey<T>) => boolean
	/**
	 * Form touches state, by default is false if `touches` are undefined or an empty object
	 */
	isTouched: boolean
	/**
	 * Form state, by default is false if `errors` are undefined or an empty object
	 */
	isValid: boolean
	/**
	 * Resets form state
	 * 
	 * @param newFrom - new form state (@default InitialForm)
	 * @param resetOptions - {@link ResetOptions}
	 * @example 
	 * ```Typescript
	 * const {
	 *   reset
	 * } = useForm(
	 *	 {
	 * 		name: 'Rimuru'
	 *	 }
	 * )
	 * ...
	 * reset({
	 * 		name: 'Rimuru Tempest'
	 * })
	 * 
	 * /// Validates new date, basically triggers validation
	 * reset(
	 * 		{
	 * 			name: 'Rimuru Tempest'
	 * 		},
	 * 		{
	 * 			validate: true
	 * 		}
	 * )
	 * ```
	 */
	reset: ResetMethod<T>
	/**
	 * Clears touch's
	 * 
	 * @example 
	 * ```Typescript
	 * const {
	 *	 resetTouch
	 * } = useForm(
	 *	 ...
	 * )
	 * ...
	 * resetTouch()
	 * ```
	 */
	resetTouch: () => void
	/**
	 * Method to set custom errors
	 * 
	 * @param errors - new custom errors 
	 * @example
	 * ```Typescript
	 * const {
	 *   setError
	 * } = useForm(
	 *	 {
	 * 		name: 'Rimuru'
	 *	 }
	 * )
	 * ...
	 * setError([
	 * 		{
	 * 			key: 'name',
	 * 			message: 'Beautiful name'
	 * 		}
	 * ])
	 * ///
	 * ```
	 */
	setError: (errors: Array<{ 
		errors: string[]
		path: FormKey<T> 
	}>) => void
	/**
	 * Manually force Controller component to update.
	 * 
	 * Note: It does not render the component alone.
	 * 
	 * @param key - key from `form` state
	 * @example 
	 * ```Typescript
	 * const {
	 *   context,
	 *	 updateController
	 * } = useForm({
	 *   keyElementOfForm: 'Rimuru'
	 * })
	 * 
	 * updateController('keyElementOfForm')
	 * 
	 * <Controller
	 *   context={context}
	 *   name="keyElementOfForm"
	 * >
	 *   {...}
	 * <Controller>
	 * ```
	 */
	updateController: (key: FormKey<T>) => void
};

export type UseFormSplitterResult<
	T extends Record<string, any>
> = UseFormReturn<T, 'formSplitter'>;
