/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { Touches } from '../hooks/useTouches';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { OnErrors } from '../validators/setDefaultOnError';

import { FormKey } from './FormKey';

export type FormErrors<T extends Record<string, any>> = { 
	[K in FormKey<T>]?: string[]
}

type IsValid<T extends Record<string, any>> = {
	/**
	 * Form state
	 */
	form: T
	/**
	 * If form is valid
	 */
	isValid: boolean
	/**
	 * Form errors
	 */
	errors: FormErrors<T> | undefined
}

export type FormOptions<T extends Record<string, any>> = {
	/**
	 * Method to validate form.
	 * Usually with some kind of validator.
	 * 
	 * @expects - to throw the errors, 
	 * 	so either `onError` or default method for `onError` {@link setDefaultOnError} can catch then 
	 * @param form - form state
	 * @example 
	 * ```Typescript
	 * const [ ... ] = useForm(
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
	validate?: (form: T) => void | Promise<void>
	/**
	 * Method to define if form is valid
	 * 
	 * @default isValid - !errors || Object.keys(errors).length === 0
	 * @param form {@link IsValid}
	 * @example 
	 * ```Typescript
	 * const [{ isValid }] = useForm(
	 *	 {
	 * 		name: 'Rimuru'
	 *	 },
	 *   {
	 * 		isValid: ({ form, isValid, errors }) => {
	 * 			/// This method changes the native `isValid`
	 * 			return true
	 * 		}
	 * 	 }
	 * )
	 * ```
	 */
	isValid?: (value: IsValid<T>) => boolean
	/**
	 * Local method to treat errors.
	 * It's preferable to use {@link setDefaultOnError}
	 * 
	 * @expects - the method to return { [key]: [errors messages] }
	 * @example 
	 * ```Typescript
	 * const [{ isValid }] = useForm(
	 *	 {
	 * 		name: 'Rimuru'
	 *	 },
	 *   {
	 * 		onErrors: ({ form, isValid, errors }) => {
	 * 			/// This method changes the native `isValid`
	 * 			return true
	 * 		}
	 * 	 }
	 * )
	 * ```
	 */
	onErrors?: OnErrors<T>
	/**
	 * Method called every time a value is changed
	 * 
	 * @example 
	 * ```Typescript
	 * const [{ isValid }] = useForm(
	 *	 {
	 * 		name: 'Rimuru'
	 *	 },
	 *   {
	 * 		onTouch: (key) => { }
	 * 	 }
	 * )
	 * ```
	 */
	onTouch?: (key: FormKey<T>, value: unknown, previousValue: unknown) => void
}

export type FieldForm<Value = any> = {
	/**
	 * Attribute `name`
	 */
	name: string
	/**
	 * Method to update values
	 */
	onChange?: (value: Value) => void
	/**
	 * Form value
	 */
	value: Value
	/**
	 * When true onChange will not be returned
	 */
	readOnly?: boolean
}

export type ProduceNewStateOptions = {
	/**
	 * Validates form if new form values are different from previous form values
	 * 
	 * @default false
	 */
	validate?: boolean
	/**
	 * Validates form regardless of conditions
	 */
	forceValidation?: boolean
	/**
	 * If `false` will not check `touches` and not call `onTouch` from options
	 * 
	 * @default true
	 */
	triggerTouched?: boolean
}

export type ResetOptions = {
	/**
	 * Validates form if new form values are different from previous form values
	 * 
	 * @default false
	 */
	validate?: boolean
	/**
	 * Validates form regardless of conditions
	 */
	forceValidation?: boolean
	/**
	 * If `false` will not check `touches` and not call `onTouch` from options
	 * 
	 * @default false
	 */
	triggerTouched?: boolean
	/**
	 * On reset `touches` will be cleared
	 * 
	 * @default true
	 */
	clearTouched?: boolean
}

export type FieldOptions<Value = any> = {
	/**
	 * Disables `onChange` method
	 */
	readOnly?: boolean
	/**
	 * Changes the value on change.
	 * 
	 * * Note: It's preferable for the input to return the actual value
	 * * 	instead of an event
	 * 
	 * @example
	 * ```Typescript
	 * 
	 * <input {
	 * 		...field('test', {
	 * 			onChange: (e) => e.target.value
	 * 		})
	 * }/>
	 * ```
	 */
	onChange?: (value: Value) => any
} & ProduceNewStateOptions

export type OnFunctionChange<T extends Record<string, any>, Result = void> = (form: T) => Result

export type SubmitHandler<T extends Record<string, any>, K = void> = (form: T) => K | Promise<K>

export type ValidateSubmission<T extends Record<string, any>> = (
	/**
	 * Form errors
	 */
	errors: FormErrors<T>, 
	/** 
	 * Original Error
	 */
	error: any
) => boolean | Promise<boolean>

export type FormStateValues<T extends Record<string, any>> = {
	/**
	 * Form state
	 */
	form: T
	/**
	 * Form errors
	 * * Note: Depends if `useForm` validate is set.
	 */
	errors: FormErrors<T> | undefined
	/**
	 * Form state, by default is false if `errors` are undefined or an empty object
	 */
	isValid: boolean
	/**
	 * Form touches // { [form key]: boolean }
	 * * Note: To be `touched` the system does a shallow comparison (ex: previousValue !== value)
	 */
	touches: Touches<T>
	/**
	 * Form touches state, by default is false if `touches` are undefined or an empty object
	 */
	isTouched: boolean
	/**
	 * Context mainly for use in `FormProvider/Controller`, basically returns {@link FormState}
	 */
	context: FormState<T>
}

export type FormActions<T extends Record<string, any>> = {
	/**
	 * Method to connect the form element to the key, by providing native attributes like `onChange`, `name`, etc
	 * 
	 * @param key - key from `form` state
	 * @param options - {@link FieldOptions}
	 * @returns - native attributes like `onChange`, `name`, `value`, `readOnly`, etc
	 * @example
	 * ```Typescript
	 * const [
	 *	 {
	 *		 ...
	 *	 },
	 *	 {
	 *		 field
	 *	 }
	 * ] = useForm(
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
	field: (key: FormKey<T>, options?: FieldOptions<any>) => FieldForm
	/**
	 * Method to make multiple changes in one render
	 * 
	 * @param cb - method that receives the `form`
	 * @param produceOptions - {@link ProduceNewStateOptions}
	 * @example
	 * ```Typescript
	 * const [
	 *	 {
	 *		 ...
	 *	 },
	 *	 {
	 *		 triggerChange
	 *	 }
	 * ] = useForm(
	 *	 ...
	 * )
	 * ...
	 * triggerChange((form) => {
	 *		form.name = 'Rimuru';
	 * 		form.age = '39';
	 * 		form.sex = 'sexless';
	 * })
	 * ...
	 * ```
	 */
	triggerChange: (cb: OnFunctionChange<T, void>, produceOptions?: ProduceNewStateOptions | undefined) => void
	/**
	 * Method to handle form submission
	 * 
	 * @param onValid - on a valid `form`, this method will be triggered
	 * @param onInvalid - method that control's the form submission when the form is invalid.
	 * 	By default `onValid` will only be called when `form` is valid, with `onInvalid` returning true
	 *  even if the `form` is invalid, `onValid` will be called
	 * @returns 
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
	 * 		(errors) => true 
	 * )
	 * ...
	 * ```
	 */
	handleSubmit: <K = void>(onValid: SubmitHandler<T, K>, onInvalid?: ValidateSubmission<T> | undefined) => () => Promise<K | undefined>
	/**
	 * Method to set custom errors
	 * 
	 * @param errors - new custom errors 
	 * @example
	 * ```Typescript
	 * const [
	 *	 {
	 *		 ...
	 *	 },
	 *	 {
	 *		 setError
	 *	 }
	 * ] = useForm(
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
	setError: (errors: Array<{ key: FormKey<T>, message: string }>) => void
	/**
	 * Returns error messages for the matched key
	 * 
	 * @param key - key from `form` state
	 * @param onlyOnTouch - when true only returns if the key was `touched` (@default false)
	 * @returns - matched key error messages
	 * @example
	 * ```Typescript
	 * const [
	 *	 {
	 *		 ...
	 *	 },
	 *	 {
	 *		 getErrors
	 *	 }
	 * ] = useForm(
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
	getErrors: (key: FormKey<T>, onlyOnTouch?: boolean) => string[]
	/**
	 * Returns `FormErrors` for the matched key
	 * 
	 * @param key - key from `form` state
	 * @returns - errors for the `key`
	 * @example
	 * ```Typescript
	 * const [
	 *	 {
	 *		 ...
	 *	 },
	 *	 {
	 *		 getFormErrors
	 *	 }
	 * ] = useForm(
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
	 * getFormErrors('product.category') 
	 * /// Can return (depends on the validation)
	 * {
	 * 		'category': [<<Error Messages>>],
	 * 		'category.name': [<<Error Messages>>],
	 * 		'category.type': [<<Error Messages>>],
	 * 		'category.type.name': [<<Error Messages>>],
	 * 		'category.type.type': [<<Error Messages>>]
	 * }
	 * ///
	 * ```
	 */
	getFormErrors: <Model extends Record<string, any>>(_key: FormKey<T>) => FormErrors<Model>
	/**
	 * Resets form state
	 * 
	 * @param newFrom - new form state (@default InitialForm)
	 * @param resetOptions - {@link ResetOptions}
	 * @example 
	 * ```Typescript
	 * const [
	 *	 {
	 *		 ...
	 *	 },
	 *	 {
	 *		 reset
	 *	 }
	 * ] = useForm(
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
	reset: (newFrom?: Partial<T>, resetOptions?: ResetOptions | undefined) => Promise<void>
	/**
	 * Unlike reset, `merge` will merge a new partial form to the new form
	 * 
	 * @param mergedForm - partial form state
	 * @example 
	 * ```Typescript
	 * const [
	 *	 {
	 *		 ...
	 *	 },
	 *	 {
	 *		 merge
	 *	 }
	 * ] = useForm(
	 *	 {
	 * 		name: 'Rimuru',
	 * 		age: '40'
	 *	 }
	 * )
	 * ...
	 * merge({
	 * 		age: '39'
	 * })
	 * ```
	 */
	merge: (mergedForm: Partial<T>) => void
	/**
	 * Returns a method to change key value
	 * 
	 * @param key - key from `form` state
	 * @param fieldOptions - {@link FieldOptions} (@default undefined)
	 * @returns - method to receive the new value
	 * @example 
	 * ```Typescript
	 * const [
	 *	 {
	 *		 ...
	 *	 },
	 *	 {
	 *		 onChange
	 *	 }
	 * ] = useForm(
	 *	 {
	 * 		name: 'Rimuru'
	 *	 }
	 * )
	 * ...
	 * onChange('name')
	 * 
	 * /// Validates form on change
	 * onChange('name', { validate: true })
	 * <input onChange={onChange('name')} />
	 * ```
	 */
	onChange: (key: FormKey<T>, fieldOptions?: FieldOptions<T[FormKey<T>]> | undefined) => (value: T[FormKey<T>]) => void
	/**
	 * Simplified version of `onChange`, without the return method
	 * 
	 * @param key - key from `form` state
	 * @param value - value for the param `key`
	 * @param produceOptions 
	 * @example 
	 * ```Typescript
	 * const [
	 *	 {
	 *		 ...
	 *	 },
	 *	 {
	 *		 changeValue
	 *	 }
	 * ] = useForm(
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
	changeValue: (key: FormKey<T>, value: T[FormKey<T>], produceOptions?: FieldOptions<any> | undefined) => void
	/**
	 * Return the value for the matched key
	 * 
	 * @param key - key from `form` state
	 * @returns - value for the param `key`
	 * @example 
	 * ```Typescript
	 * const [
	 *	 {
	 *		 ...
	 *	 },
	 *	 {
	 *		 changeValue
	 *	 }
	 * ] = useForm(
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
	 * Clears touch's
	 * 
	 * * Note: Will not render the component
	 * @example 
	 * ```Typescript
	 * const [
	 *	 {
	 *		 ...
	 *	 },
	 *	 {
	 *		 resetTouch
	 *	 }
	 * ] = useForm(
	 *	 ...
	 * )
	 * ...
	 * resetTouch()
	 * ```
	 */
	resetTouch: () => void
	/**
	 * Triggers manual touch
	 * 
	 * * Note: Will not render the component
	 * @param key - key from `form` state
	 * @example 
	 * ```Typescript
	 * const [
	 *	 {
	 *		 ...
	 *	 },
	 *	 {
	 *		 resetTouch
	 *	 }
	 * ] = useForm(
	 *	 {
	 * 		name: 'Rimuru'
	 *	 }
	 * )
	 * ...
	 * triggerManualTouch('name')
	 * ```
	 */
	triggerManualTouch: <Key extends FormKey<T>>(keys: Key | Key[]) => void
}

export type FormState<T extends Record<string, any>> = [
	FormStateValues<T>,
	FormActions<T>
]
