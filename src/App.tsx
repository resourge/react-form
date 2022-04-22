import React from 'react';

import { useForm, useFormField, Controller, FormProvider } from './lib'

type CustomType = {
	list: number[]
}

const CustomComponent: React.FC<{index: number}> = ({ index }) => {
	const { 
		formState: [
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			_,
			{
				triggerChange
			}
		] 
	} = useFormField<CustomType>(`list[${index}]`)

	console.log('Render', index)
	
	return (
		<>
			<button onClick={() => {
				triggerChange((form) => {
					form.list.splice(0, 2)
				})
			}}>
				Change with random value
			</button>
			{ Math.random() }
		</>
	);
};

function App() {
	const [
		{
			context,
			form
		}
	] = useForm<CustomType>({
		list: [
			1,
			2,
			3,
			4
		]
	})

	return (
		<FormProvider context={context}>
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				{
					form.list.map((_: any, index: number) => (
						<Controller
							key={`${index}`}
							name={`list[${index}]`}
							context={context}
						>
							<CustomComponent index={index} />
						</Controller>
					))
				}
			</div>
		</FormProvider>
	)
}

export default App

/*
function App() {
	return (
		<div>
			App
		</div>
	)
}

export default App
*/
