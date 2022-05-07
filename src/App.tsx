/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as yup from 'yup'

import { useForm } from './lib'

const schema = yup.object().shape({
	users: yup.array().of(yup.object().shape({
		name: yup.string().required(),
		message: yup.string().required()
	})),
	meta: yup.object().shape({ parkingSlots: yup.number().min(0).required() }
	)
})

function App() {
	const {
		form,
		field,
		formState
	} = useForm(
		{
			users: [{ id: 0, name: 'Jorge', message: '' }, { id: 1, name: 'Jessica', message: '' }],
			meta: {
				parkingSlots: 38
			}
		},
		{
			validate: async (form) => {
				await schema.validate( form );
			},
			validateDefault: true
		}
	)
	console.log(formState.users[0])
	return (
		<div>
			{form.users.map((user, index) => <div key={user.id}>
				
				<input {...field(`users[${index}].name`)} onChange={(e) => {
					// @ts-expect-error
					field(`users[${index}].name`).onChange(e.target.value)
				}}/>
				{!formState.users[index].name.isValid ? <span>{formState.users[index].name.errors[0]}</span> : null }
				<input {...field(`users[${index}].message`)} />
				{!formState.users[index].message.isValid ? <span>{formState.users[index].message.errors[0]}</span> : null }
				
			</div>)}
		</div>)	
}

export default App
