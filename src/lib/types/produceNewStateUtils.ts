import { type FormKey } from './FormKey'
import {
	type FormOptions,
	type ProduceNewStateOptions,
	type ResetOptions,
	type State
} from './types'

type FinalProduceStateProps<T extends Record<string, any>> = {
	newState: State<T>
	setFormState: (newState: State<T>) => void
	options?: FormOptions<T>
	produceOptions?: ProduceNewStateOptions & ResetOptions
}

export const finalProduceState = <T extends Record<string, any>>(
	{
		newState,
		setFormState,
		options,
		produceOptions
	}: FinalProduceStateProps<T>
) => {
	if ( options?.onChange ) {
		options.onChange(newState)
	}

	if ( produceOptions?.clearTouched ) {
		newState.touches = {};
	}
			
	setFormState(newState);
}

type ValidateProduceState<T extends Record<string, any>> = {
	unsubscribe: () => T
	validateState: (state: State<T>) => State<T> | Promise<State<T>>
} & FinalProduceStateProps<T>

export const validateProduceState = <T extends Record<string, any>>({
	newState,
	unsubscribe,
	validateState,
	setFormState,
	options,
	produceOptions
}: ValidateProduceState<T>) => {
	newState.form = unsubscribe();

	const validate = produceOptions?.validate ?? (options?.validateDefault ?? true);

	if ( 
		Boolean(produceOptions?.forceValidation) || validate
	) {
		const validateStateResult = validateState(newState);

		if ( validateStateResult instanceof Promise ) {
			return validateStateResult
			.then((newState) => {
				finalProduceState<T>({
					newState,
					setFormState,
					options,
					produceOptions
				})
			})
		}

		newState = validateStateResult; 
	}

	finalProduceState<T>({
		newState,
		setFormState,
		options,
		produceOptions
	})
}

type ExecuteWatchProduceState<T extends Record<string, any>> = {
	changedKeys: React.MutableRefObject<Set<FormKey<T>>>
	hasWatchingKeys: (changedKeys: React.MutableRefObject<Set<string>>) => boolean
	onWatch: React.MutableRefObject<(form: Record<string, any>, changedKeys: React.MutableRefObject<Set<string>>) => Promise<void>>
	proxy: T
	setFormData: (value: State<T>['form']) => void
} & ValidateProduceState<T>

/**
 * First function to execute 
 */
// (This was necessary to prevent jumping cursor on inputs (doesn't prevent incases where validation is async, but in those cases debounce is also usually used))
export const executeWatch = <T extends Record<string, any>>({
	setFormData,
	hasWatchingKeys,
	onWatch,
	proxy,
	changedKeys,
	newState,
	unsubscribe,
	validateState,
	setFormState,
	options,
	produceOptions
}: ExecuteWatchProduceState<T>) => {
	setFormData(newState.form);

	if ( hasWatchingKeys(changedKeys) ) {
		return onWatch.current(proxy, changedKeys)
		.then(() => {
			validateProduceState({
				newState,
				unsubscribe,
				validateState,
				setFormState,
				options,
				produceOptions
			})
		})
	}

	validateProduceState({
		newState,
		unsubscribe,
		validateState,
		setFormState,
		options,
		produceOptions
	})
}
