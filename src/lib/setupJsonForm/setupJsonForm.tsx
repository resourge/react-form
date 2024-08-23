import { forwardRef, useMemo } from 'react';

import { FormProvider } from '../components';
import { useForm } from '../hooks';
import { type FormOptions, type UseFormReturn } from '../types';

export type SetupJsonFormProps<
	FormSchema extends object, 
	DefaultData extends Record<string, any>
> = { 
	schema: FormSchema
	initialData?: DefaultData 
};

export type SetupJsonFormConfig<Ref> = {
	render: (
		props: any,
		formContext: UseFormReturn<Record<string, any>>,
		ref: React.ForwardedRef<Ref>
	) => JSX.Element
	validate: (schema: unknown) => FormOptions<Record<string, any>>['validate']
	getInitialData?: <T = unknown>(schema: T) => unknown
} & Omit<FormOptions<Record<string, any>>, 'validate'>;

export function setupJsonForm<Ref>({
	render,
	validate,
	getInitialData,
	...formProps
}: SetupJsonFormConfig<Ref>) {
	return forwardRef<
		Ref,
		SetupJsonFormProps<Record<string, any>, Record<string, any>>
	>(function JsonForm(props, ref) {
		const schemaValidation = useMemo(() => validate(props.schema), []);

		const formReturn = useForm<Record<string, any>>(
			() => props.initialData ?? (getInitialData ? getInitialData(props.schema) : ({} as Record<string, any>)),
			{
				...formProps,
				validate: schemaValidation
			}
		);

		return (
			<FormProvider context={formReturn.context}>
				{
					render(
						props,
						formReturn,
						ref
					)
				}
			</FormProvider>
		);
	});
}
