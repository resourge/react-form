import { FormProvider, useForm, useFormSplitter } from './lib';

type Props = {
};

const Child: React.FC<Props> = ({ }) => {
	console.log('render Child');
	const {
		changeValue, form, handleSubmit, getErrors
	} = useFormSplitter('test2');
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

const Child3: React.FC<Props> = ({ }) => {
	console.log('render Child');
	const {
		changeValue, form, handleSubmit, getErrors
	} = useFormSplitter('test3');
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
	const {
		changeValue, form, context 
	} = useForm({
		test: 10,
		test1: 11,
		test2: {
			test: 11,
			test1: 12
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
				}
			];
		}
	});

	console.log('render Parent');

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
