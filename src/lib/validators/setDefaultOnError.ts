export type ValidationError = {
	error: string
	path: string | string[]
}
export type ValidationWithErrors = {
	errors: string[]
	path: string | string[]
}

export type ValidationErrors = Array<ValidationError | ValidationWithErrors>

export type OnErrors = (errors: any | any[]) => ValidationErrors

export let onErrorFn: OnErrors = (errors) => errors;

export const getDefaultOnError = () => {
	return onErrorFn;
};

export const setDefaultOnError = (onError: OnErrors) => {
	onErrorFn = onError;
};
