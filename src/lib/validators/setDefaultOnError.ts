export type ValidationError = {
	path: string | string[]
	error: string
}
export type ValidationWithErrors = {
	path: string | string[]
	errors: string[]
}

export type ValidationErrors = Array<ValidationError | ValidationWithErrors>

export type OnErrors = (errors: any | any[]) => ValidationErrors

export let onErrorFn: OnErrors = (errors) => errors

export const getDefaultOnError = () => {
	return onErrorFn;
}

export const setDefaultOnError = (onError: OnErrors) => {
	onErrorFn = onError;
}
