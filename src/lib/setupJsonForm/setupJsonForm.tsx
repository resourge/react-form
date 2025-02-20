import { forwardRef, useMemo, type JSX } from 'react';

import { FormProvider } from '../components';
import { useForm } from '../hooks';
import { type FormOptions, type UseFormReturn } from '../types';

export type SetupJsonFormProps<
	FormSchema extends object,
	DefaultData extends Record<string, any>
> = {
	schema: FormSchema
	initialData?: DefaultData
} & Omit<FormOptions<Record<string, any>>, 'validate'>;

export type SetupJsonFormConfig<
	Ref,
	Props extends SetupJsonFormProps<Record<string, any>, Record<string, any>>
> = {
	render: (
		props: Props,
		formContext: UseFormReturn<Record<string, any>>,
		ref: React.ForwardedRef<Ref>
	) => JSX.Element
	validate: (schema: unknown) => FormOptions<Record<string, any>>['validate']
	getInitialData?: <T = unknown>(schema: T) => unknown
};

export default function setupJsonForm<
	Ref,
	Props extends SetupJsonFormProps<Record<string, any>, Record<string, any>>
>({
	render, validate, getInitialData 
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
