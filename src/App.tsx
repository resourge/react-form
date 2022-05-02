import React from 'react';

import { Controller, useForm } from './lib'
import { useController } from './lib/contexts/ControllerContext';

function CustomElement({ value }: { value: number }) {
	// Value is not really necessary using `useFormField` but it's for the example
	const { 
		formState: [
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			_,
			{
				triggerChange
			}
		]
	} = useController<{ list: number[] }>()

	return (
		<div>
			{ Math.random() } <button
				onClick={() => {
					triggerChange((form) => {
						form.list[1] = 10;
					}, { validate: true })
				}}
			>
				Update with random value
			</button>
		</div>
	)
}

function App() {
	const [
		{
			context,
			form
		}
	] = useForm(
		{
			list: Array.from({ length: 3 }).map((_, index) => index + 1)
		},
		{
			validate: () => {
				throw new Error()
			},
			onErrors: () => {
				return {
					'list[0]': ['RAFAEL']
				}
			}
		}
	)

	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			{
				form.list.map((value, index) => {
					return (
						<Controller
							key={`${index}`}
							name={`list[${index}]`}
							context={context}
						>
							<CustomElement value={value} />
						</Controller>
					)
				})
			}
		</div>
	)
}

export default App
