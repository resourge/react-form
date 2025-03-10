import React, { createContext } from 'react';

import { FormProvider, useForm } from './lib';

type Props = {
};

const Child: React.FC<Props> = ({ }) => {
	console.log('Render Child');
	return (
		<>Child</>
	);
};

const Context = createContext(10);

function App() {
	const { context, form } = useForm({
		test: 10,
		test1: 10
	});
	console.log('form.test', form.test);
	return (
		<>
			<button
				onClick={() => {
					form.test1 = Math.random();
				}}
			>
				Change
			</button>
			<Context.Provider value={form.test}>
				<Child />
			</Context.Provider>
		</>
	);
}

export default App;
