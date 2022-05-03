export type ValidationErrors = Array<{
	path: string | string[]
	errors: string[]
}>

export type OnErrors = (errors: any | any[]) => ValidationErrors

export let onErrorFn: undefined | OnErrors

export const getDefaultOnError = () => {
	return onErrorFn;
}

export const setDefaultOnError = (onError: OnErrors) => {
	onErrorFn = onError;
}
