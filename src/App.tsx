import React from 'react';

import {
	FormProvider,
	FormSplitterContext,
	FormSplitterProvider,
	useForm,
	useFormSplitter
} from './lib';

type Props = {
};

const Child = () => {
	const {
		form, context, field, getErrors
	} = useFormSplitter('child');

	console.log(form.value, form);
	
	return (
		<FormSplitterProvider context={context}>
			<input
				{...field('value')}
			/>
			<br />
			Errors: 
			{ ' ' }
			{ getErrors('') }
			<br />
			{
				form.child
					? (
						<Child />
					) : (<></>)
			}
		</FormSplitterProvider>
	);
};

const Root = () => {
	const {
		form, context, field 
	} = useFormSplitter('root');

	console.log('Root', form);
	
	return (
		<FormSplitterProvider context={context}>
			<input
				{...field('value')}
			/>
			<br />
			<Child />
		</FormSplitterProvider>
	);
};

const App: React.FC<Props> = ({ }) => {
	const {
		form, context, reset, handleSubmit
	} = useForm(
		{
			root: {
				value: 'root',
				child: {
					value: 'child1',
					child: {
						value: 'child2'
					}
				}
			}
		},
		{
			validate: (form) => {
				console.log('form', form);
				return [
					form.root.child.child.value === 'child2' 
						? {
							path: 'root.child',
							error: `Error`
						} : undefined,
					form.root.child.child.value === 'child2' 
						? {
							path: 'root.child.child',
							error: `Error`
						} : undefined
				].filter(Boolean) as any;
			}
		}
	);
	console.log('form', form);
	return (
		<FormProvider context={context}>
			<Root />

			<button
				onClick={() => {
					form.root.child = {
						value: 'child1.1',
						child: {
							value: 'child2.1'
						}
					};
				}}
			>
				Set Child
			</button>
			<button
				onClick={handleSubmit(() => {

				})}
			>
				handleSubmit
			</button>
		</FormProvider>
	);
};

export default App;
