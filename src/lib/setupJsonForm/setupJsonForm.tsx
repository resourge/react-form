import {
	type ForwardedRef,
	forwardRef,
	type JSX,
	useMemo
} from 'react';

import { FormProvider } from '../components';
import { useForm } from '../hooks';
import { type FormOptions, type UseFormReturn } from '../types';

export type SetupJsonFormConfig<
	Ref,
	Props extends SetupJsonFormProps<Record<string, any>, Record<string, any>>
> = {
	getInitialData?: <T = unknown>(schema: T) => unknown
	render: (
		props: Props,
		formContext: UseFormReturn<Record<string, any>>,
		ref: ForwardedRef<Ref>
	) => JSX.Element
	validate: (schema: unknown) => FormOptions<Record<string, any>>['validate']
};

export type SetupJsonFormProps<
	FormSchema extends object,
	DefaultData extends Record<string, any>
> = Omit<FormOptions<Record<string, any>>, 'validate'> & {
	initialData?: DefaultData
	schema: FormSchema
};

export function setupJsonForm<
	Ref,
	Props extends SetupJsonFormProps<Record<string, any>, Record<string, any>>
>({
	getInitialData, render, validate 
}: SetupJsonFormConfig<Ref, Props>) {
	return forwardRef<Ref, Props>(function JsonForm(props, ref) {
		const schemaValidation = useMemo(() => validate(props.schema), []);

		const formReturn = useForm<Record<string, any>>(
			() =>
				props.initialData
				?? (getInitialData
					? getInitialData(props.schema)
					: ({} as Record<string, any>)),
			{
				...props,
				validate: schemaValidation
			}
		);

		return (
			<FormProvider context={formReturn.context}>
				{ render(props as Props, formReturn, ref) }
			</FormProvider>
		);
	});
}
