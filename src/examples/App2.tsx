import { type FC } from 'react';

import { FormProvider, useForm, useFormSplitter } from '../lib';

type Props = {
};

const Asd = () => {
	const { form, reset } = useFormSplitter('test.test');
	
	return (
		<button
			onClick={() => {
				const v = form.at(0);

				reset([...form, {
					...v,
					id: 10 
				}]);
			}}
		>
			Reset
		</button>
	);
};

const Asd1 = () => {
	const { form, reset } = useFormSplitter('test.test');
	
	return (
		<button
			onClick={() => {
				const v = form.at(0);

				reset([...form, {
					...v,
					id: 10 
				}]);
			}}
		>
			Reset
		</button>
	);
};

function App() {
	const { context } = useForm(
		{
			test: {
				test: []
			}
		}, 
		{
			validate: (form) => {
				const val = form.test.test[0];
				console.log('val', val);
				const val1 = form.test.test[1];
				console.log('val1', val1);
	
				return [];
			},
			validationType: 'onTouch'
		}
	);

	return (
		<FormProvider context={context}>
			<Asd />
		</FormProvider>
	);
}

export default App;
