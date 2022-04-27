import { FormErrors } from '../types/types';

export type OnErrors<T extends Record<string, any>> = (errors: any | any[]) => FormErrors<T>

export let onErrorFn: undefined | OnErrors<any>

export const getDefaultOnError = () => {
	return onErrorFn;
}

export const setDefaultOnError = (onError: OnErrors<any>) => {
	onErrorFn = onError;
}
