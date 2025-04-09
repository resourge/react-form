import React, { memo } from 'react';

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

	console.log(form.value);
	
	return (
		<FormSplitterProvider context={context}>
			<input
				{...field('value')}
			/>
			<br />
			Errors: 
			{ ' ' }
			{ getErrors('value') }
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

	console.log('Root');
	
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

const Side = memo(() => {
	const {
		form, getErrors, field 
	} = useFormSplitter('side');

	console.log('side');
	
	return (
		<>
			<input
				{...field('value')}
			/>
			<br />
			Errors: 
			{ ' ' }
			{ getErrors('') }
			<br />
		</>
	);
});

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
			},
			side: {
				value: 10
			}
		},
		{
			validate: (form) => {
				return [
					form.root.child.value === 'child1' 
						? {
							path: 'root.child.value',
							error: `Error`
						} : undefined,
					form.root.child.child.value === 'child2' 
						? {
							path: 'root.child.child.value',
							error: `Error`
						} : undefined,
					form.root.child.child.value === 'child2' 
						? {
							path: 'side',
							error: `Error`
						} : undefined
				].filter(Boolean) as any;
			}
		}
	);
	console.log('form');
	return (
		<FormProvider context={context}>
			<Root />
			<Side />
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
