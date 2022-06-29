/* eslint-disable @typescript-eslint/no-invalid-void-type */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Ref } from 'react';

import { FormContextObject } from '../contexts/FormContext';
import { WatchMethod } from '../hooks/useWatch';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { OnErrors, setDefaultOnError, ValidationErrors } from '../validators/setDefaultOnError';

import { FormKey } from './FormKey';

export type Touches<T extends Record<string, any>> = {
	/**
	 * Paths for the keys touched
	 */
	[K in FormKey<T>]?: boolean
}

export type FormErrors<T extends Record<string, any>> = { 
	[K in FormKey<T>]?: string[]
}

export type HasErrorOptions = {
	/**
	 * Includes object/array children
	 */
	strict?: boolean
	/**
	 * When true only returns if the key was `touched` (@default false)
	 */
	onlyOnTouch?: boolean
}

export type GetErrorsOptions = {
	/**
	 * Includes children errors as object into array.
	 * 
	 * Note: If `includeChildsIntoArray` is true `strict`
	 * will by default be false
	 */
	strict?: boolean
	/**
	 * When true only returns if the key was `touched` (@default false)
	 */
	onlyOnTouch?: boolean
	/**
	 * Includes `key` in children paths
	 */
	includeKeyInChildErrors?: boolean
	/**
	 * Includes the children errors on the array
	 */
	includeChildsIntoArray?: boolean
}

export type GetErrors<T extends Record<string, any>> = string[] & FormErrors<T>

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
	 * If form is "touched"
	 */
	isTouched: boolean
	/**
	 * Form nested errors
	 */
	errors: FormErrors<T>
	/**
	 * Form touched keys
	 */
	touches: Touches<T>
	/**
	 * Form touched keys
	 */
	formState: FormState<T>
}

export type FormOptions<T extends Record<string, any>> = {
	/**
	 * Validate form.
	 * When `true` every change batch will validate the form
	 * With `false` will only validate on method {@link FormActions#handleSubmit} 
	 * or if {@link FieldOptions#validate}/{@link ProduceNewStateOptions#validate} is set `true`.
	 * 
	 * * Note: Local {@link FieldOptions#validate} takes priority over global {@link FormOptions#validateDefault}
	 * @default true
	 */
	validateDefault?: boolean 
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
	 * Method to define if form is valid
	 * 
	 * @default isValid - !errors || Object.keys(errors).length === 0
	 * @param form {@link IsValid}
	 * @example 
	 * ```Typescript
	 * const { isValid } = useForm(
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
	 * const { ... } = useForm(
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
	onErrors?: OnErrors
	/**
	 * Method called every time a value is changed
	 * 
	 * @example 
	 * ```Typescript
	 * const { ... } = useForm(
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
	/**
	 * Max number of "previous changes" the system will hold.
	 * After 15 the first changes start to be replaced with the new ones.
	 * @important In case of huge numbers the system performance may be impacted.
	 * @default 15
	 * @example 
	 * ```Typescript
	 * const  = useForm(
	 *	 {
	 * 		name: 'Rimuru'
	 *	 },
	 *   {
	 * 		maxHistory: 10
	 * 	 }
	 * )
	 * ```
	 */
	maxHistory?: number
}

export type FieldFormBlur<Value = any, Name = string> = {
	/**
	 * Attribute `name`
	 */
	name: Name
	/**
	 * Method to update values
	 */
	onBlur?: (value: Value) => void
	/**
	 * When true onChange will not be returned
	 */
	readOnly?: boolean
	/**
	 * Form value
	 */
	defaultValue: Value
}

export type FieldFormReadonly<Value = any, Name = string> = {
	/**
	 * Attribute `name`
	 */
	name: Name
	/**
	 * When true onChange will not be returned
	 */
	readOnly?: boolean
	/**
	 * Form value
	 */
	value: Value
}

export type FieldFormChange<Value = any, Name = string> = {
	/**
	 * Attribute `name`
	 */
	name: Name
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

export type FieldForm<Value = any, Name = string> = FieldFormReadonly<Value, Name> | FieldFormBlur<Value, Name> | FieldFormChange<Value, Name>

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

export type ProduceNewStateOptionsHistory = ProduceNewStateOptions & {
	
	type?: 'UNDO' | 'REDO'
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
	blur?: boolean
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

export type FormState<T> = (T extends object ? { 
	[K in keyof T]-?: T[K] extends object ? FormState<T[K]> : {
		/**
		 * Error for current key
		 */
		errors: string[]
		/**
		 * isValid for current key
		 */
		isValid: boolean
		/**
		 * isTouched for current key
		 */
		isTouched: boolean
	} 
} : {
	/**
	 * Error for current key
	 */
	errors: string[]
	/**
	 * isValid for current key
	 */
	isValid: boolean
	/**
	 * isTouched for current key
	 */
	isTouched: boolean
} ) & {
	/**
	 * Error for current key
	 */
	errors: string[]
	/**
	 * isValid for current key
	 */
	isValid: boolean
	/**
	 * isTouched for current key
	 */
	isTouched: boolean
} 

export interface UseFormReturn<T extends Record<string, any>> {
	/**
	 * Form state
	 */
	form: T
	/**
	 * Context mainly for use in `FormProvider/Controller`, basically returns {@link FormState}
	 */
	context: FormContextObject<T>
	/**
	 * Form errors
	 * * Note: Depends on {@link FormOptions#validate}.
	 */
	errors: FormErrors<T>
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
	 * Virtual nested object that has information on the `key` like errors/isTouched/isValid
	 */
	formState: FormState<T>
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
	field: {
		(key: FormKey<T>, options: FieldOptions<any> & { blur: true }): FieldFormBlur
		(key: FormKey<T>, options: FieldOptions<any> & { readonly: true }): FieldFormReadonly
		(key: FormKey<T>, options?: FieldOptions<any>): FieldFormChange
	}
	/**
	 * Method to make multiple changes in one render
	 * 
	 * @param cb - method that receives the `form`
	 * @param produceOptions - {@link ProduceNewStateOptions}
	 * @example
	 * ```Typescript
	 * const {
	 *   triggerChange
	 * } = useForm(
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
	setError: (errors: Array<{ path: FormKey<T>, errors: string[] }>) => void
	/**
	 * Method to verify if `key` has errors
	 * 
	 * @param key - key from `form` state
	 * @param options - {@link HasErrorOptions}
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
	hasError: (key: FormKey<T>, options?: HasErrorOptions) => boolean
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
	getErrors: <Model extends Record<string, any> = T>(key: FormKey<T>, options?: GetErrorsOptions) => GetErrors<Model>
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
	reset: (newFrom: Partial<T>, resetOptions?: ResetOptions | undefined) => Promise<void>
	/**
	 * Unlike reset, `merge` will merge a new partial form to the new form
	 * 
	 * @param mergedForm - partial form state
	 * @example 
	 * ```Typescript
	 * const {
	 *   merge
	 * } = useForm(
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
	 * const {
	 *   onChange
	 * } = useForm(
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
	changeValue: (key: FormKey<T>, value: T[FormKey<T>], produceOptions?: FieldOptions<any> | undefined) => void
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
	 * Watch key to then execute the method to update other values
	 * 
	 * @param key - key from `form` state
	 * @param method - method that will be executed on key touch
	 * @example 
	 * ```Typescript
	 * const {
	 *	 watch
	 * } = useForm(
	 *	 {
	 * 		name: 'Rimuru'
	 *	 }
	 * )
	 * ...
	 * watch('name', (form) => {
	 * 	form.name = 'Rimuru Tempest'
	 * })
	 * ```
	 */
	watch: (key: FormKey<T>, method: WatchMethod<T>) => void
	/**
	 * Manually force Controller component to update.
	 * 
	 * Note: It does not render the component alone.
	 * 
	 * @param key - key from `form` state
	 * @example 
	 * ```Typescript
	 * const {
	 *	 updateController
	 * } = useForm(
	 *	 {
	 * 		name: 'Rimuru'
	 *	 }
	 * )
	 * ...
	 * updateController('name')
	 * ```
	 */
	updateController: (key: FormKey<T>) => void
	/**
	 * Revert last change. (If there is one)
	 * @example 
	 * ```Typescript
	 * const {
	 *	 undo
	 * } = useForm()
	 * ...
	 * undo
	 * ```
	 */
	undo: () => void
	/**
	 * Forward last undo. (If there is one)
	 * @example 
	 * ```Typescript
	 * const {
	 *	 redo
	 * } = useForm()
	 * ...
	 * redo('name')
	 * ```
	 */
	redo: () => void	
}

export type UseFormReturnController<T extends Record<string, any>> = UseFormReturn<T> & {
	/**
	 * Current changed keys. It is used in the `Controller` component
	 */
	changedKeys: React.MutableRefObject<Set<FormKey<T>>>
}
