/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useControllerContext } from '../contexts/ControllerContext';
import { useBaseFormContext } from '../contexts/FormContext';
import { useBaseFormSplitterContext } from '../contexts/FormSplitterContext';
import { type FormKey } from '../types/FormKey';
import { type PathValue } from '../types/PathValue';
import { type UseFormSplitterResult } from '../types/formTypes';
import { IS_DEV } from '../utils/constants';

import { useFormCore } from './useFormCore';

type UseFormSplitterResultByKey<
	T extends Record<string, any>,
	K extends FormKey<T>
> = UseFormSplitterResult<PathValue<T, K>>;

/**
 * Hook to create a splitter form. Serves to create a form for the specific "formFieldKey"
 * * Note: useFormSplitter used inside a Controller doesn't need "formFieldKey" otherwise is mandatory
 * @param formFieldKey - key from `form` state 
 */
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(): UseFormSplitterResultByKey<T, K>;
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(fieldKey: K): UseFormSplitterResultByKey<T, K>;
export function useFormSplitter<
	T extends Record<string, any>,
	K extends FormKey<T>
>(fieldKey?: K): UseFormSplitterResultByKey<T, K> {
	const controllerContext = useControllerContext();
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const context = useBaseFormSplitterContext<PathValue<T, K>>() ?? useBaseFormContext<PathValue<T, K>>();
	const formFieldKey = fieldKey ?? (controllerContext?.name as K);

	if ( IS_DEV ) {
		if ( !formFieldKey ) {
			throw new Error('\'formFieldKey\' undefined can only used inside a Controller component.');
		}
	}

	return useFormCore<PathValue<T, K>, 'formSplitter'>({
		context,
		type: 'formSplitter',
		formFieldKey
	}) as unknown as UseFormSplitterResultByKey<T, K>;
}
