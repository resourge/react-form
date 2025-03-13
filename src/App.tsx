import React, { useMemo, useState } from 'react';

import {
	FormProvider,
	FormSplitterContext,
	FormSplitterProvider,
	useForm,
	useFormSplitter
} from './lib';

type ChildAsdProps = {
};

const ChildAsd: React.FC<ChildAsdProps> = ({ }) => {
	const {
		changeValue, form, handleSubmit, getErrors, context, errors, reset
	} = useFormSplitter('asd');
	console.log('render Child asd', errors);

	return (
		<>
			<br />
			<br />
			<br />
			ASD
			<br />
			Errors: 
			{ ' ' }
			{ getErrors('asd') }
			<br />
			asd.asd: 
			{ ' ' }
			{ form.asd }
			<br />
			<button
				onClick={() => {
					reset({
						asd: 100,
						asd1: 10000
					});
				}}
			>
				Reset
			</button>
			<br />
			<button
				onClick={handleSubmit(() => {

				})}
			>
				Submit
			</button>
			<button
				onClick={() => {
					form.asd = Math.random();
				}}
			>
				Child Change asd
			</button>
			<br />
			<button
				onClick={() => {
					form.asd1 = Math.random();
				}}
			>
				Child Change asd1
			</button>
		</>
	);
};

type Props = {
};

const Child: React.FC<Props> = ({ }) => {
	const {
		changeValue, form, handleSubmit, getErrors, context, errors
	} = useFormSplitter('test2');
	console.log('render Child', errors);
	return (
		<FormSplitterProvider context={context}>
			<br />
			<br />
			<br />
			Child
			<br />
			Errors: 
			{ ' ' }
			{ getErrors('test') }
			<br />
			test2.test: 
			{ ' ' }
			{ form.test }
			<br />
			test2.asd.asd: 
			{ ' ' }
			{ form.asd.asd }
			<br />
			<button
				onClick={handleSubmit(() => {

				})}
			>
				Submit
			</button>
			<button
				onClick={() => {
					form.test = Math.random();
				}}
			>
				Child Change test
			</button>
			<br />
			<button
				onClick={() => {
					form.test1 = Math.random();
				}}
			>
				Child Change test1
			</button>
			<ChildAsd />
		</FormSplitterProvider>
	);
};

const Child3: React.FC<Props> = ({ }) => {
	console.log('render Child');
	console.time('2');
	const {
		changeValue, form, handleSubmit, getErrors
	} = useFormSplitter('test3');
	console.timeEnd('2');
	console.log('test1', form.test1);
	return (
		<>
			<br />
			<br />
			<br />
			Child
			<br />
			Errors: 
			{ ' ' }
			{ getErrors('test') }
			<br />
			test2.test: 
			{ ' ' }
			{ form.test }
			<br />
			<button
				onClick={handleSubmit(() => {

				})}
			>
				Submit
			</button>
			<button
				onClick={() => {
					form.test = Math.random();
				}}
			>
				Child Change test
			</button>
			<br />
			<button
				onClick={() => {
					form.test1 = Math.random();
				}}
			>
				Child Change test1
			</button>
		</>
	);
};

function App() {
	console.time('1');
	const {
		changeValue, form, context, handleSubmit
	} = useForm({
		test: 10,
		test1: 11,
		test2: {
			test: 11,
			test1: 12,
			asd: {
				asd: 11,
				asd1: 12
			}
		},
		test3: {
			test: 13,
			test1: 13
		},
		getTest() {
			return this.test;
		}
	}, {
		validate() {
			return [
				{
					path: 'test',
					error: 'FUCK'
				},
				{
					path: 'test2.test',
					error: 'FUCK'
				},
				{
					path: 'test3.test',
					error: 'FUCK'
				},
				{
					path: 'test2.asd.asd',
					error: 'FUCK'
				}
			];
		}
	});
	console.timeEnd('1');

	const a = useMemo(() => {
		console.log('ASDASDAS');
		return context;
	}, [context]);

	console.log('render Parent', form);

	return (
		<FormProvider context={context}>
			test: 
			{ ' ' }
			{ form.getTest() }
			<br />
			test2.test1: 
			{ ' ' }
			{ form.test2.test1 }
			<br />
			<button
				onClick={handleSubmit(() => {

				})}
			>
				Submit
			</button>
			<button
				onClick={() => {
					changeValue('test', Math.random());
				}}
			>
				Change test
			</button>
			<br />
			<button
				onClick={() => {
					changeValue('test1', Math.random());
				}}
			>
				Change test1
			</button>
			<button
				onClick={() => {
					form.test2.test1 = Math.random();
				}}
			>
				Change form.test2.test1
			</button>

			<Child />
			<Child3 />
		</FormProvider>
	);
}

export default App;
