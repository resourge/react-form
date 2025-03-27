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
		form, context, field 
	} = useFormSplitter('child');

	console.log(form.value, form);
	
	return (
		<FormSplitterProvider context={context}>
			<input
				{...field('value')}
			/>
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
	const { form, context } = useForm({
		root: {
			value: 'root',
			child: {
				value: 'child1',
				child: {
					value: 'child2'
				}
			}
		}
	});
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
		</FormProvider>
	);
};

export default App;
