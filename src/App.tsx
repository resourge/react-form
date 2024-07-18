import { useEffect } from 'react';

import { useForm } from './lib';

function App() {
	const {
		form, field, changeValue, errors, watch, context
	} = useForm({
		name: '',
		age: 10,
		email: ''
	}, {
		validate: async (form) => {
			console.log('validating', JSON.stringify(form));
			await (new Promise((resolve) => setTimeout(resolve, 500)));
			return [
				{
					path: 'name',
					error: 'qwe'
				}
			];
		}
	});

	watch('age', (form) => {
		form.age = form.age * 10;
	});

	return (
		<form action="">
			<div>
				App
				name: 
				{ form.name } 
				{ ' ' }
				<br />
				age: 
				{ form.age } 
				{ ' ' }
				<br />
				email: 
				{ form.email } 
				{ ' ' }
				<br />
				<input
					value={form.name}
					onChange={(e) => {
						form.name = e.currentTarget.value;

						// await (new Promise((resolve) => setTimeout(resolve, 500)));

						form.email = form.name;
						form.age = Math.random();
					}}
				/>
				<button formAction="" />
			</div>
		</form>
	);
}

export default App;
