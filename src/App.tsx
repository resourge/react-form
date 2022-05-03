import { Controller, useForm } from './lib'
import { useController } from './lib/contexts/ControllerContext';

function CustomElement({ value }: { value: number }) {
	// Value is not really necessary using `useFormField` but it's for the example
	const { 
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		field,
		formState: [
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			_,
			{
				triggerChange
			}
		]
	} = useController<{ list: number[] }, number>()

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
			form,
			errors
		},
		{
			getErrors,
			hasError,
			setError
		}
	] = useForm(
		{
			list: Array.from({ length: 3 }).map((_, index) => index + 1),
			test: [
				{
					test: 1,
					test1: {
						test: 1
					}
				}
			]
		},
		{
			validateDefault: true,
			validate: () => {
				throw new Error()
			},
			onErrors: () => {
				return [
					{
						path: 'test',
						errors: ['Rafael']
					},
					{
						path: 'test[5].test',
						errors: ['Rafael2']
					},
					{
						path: 'test[5].test1.test',
						errors: ['Rafael3']
					}
				]
			}
		}
	)

	// @ts-expect-error
	console.log('errors', errors.test[2].test)
	
	/*
	const a = getErrors('test');

	console.log('hasError', a.hasError);

	const a1 = getErrors('test', { strict: false });

	console.log('strict', a1.test && a1.test);

	console.log('getErrors', getErrors('test', { strict: false }) )
	console.log('getErrors', getErrors('test[0]', { strict: false, includeKeyInChildErrors: false }) )
	console.log('is valid', getErrors('test'))
	console.log('is valid', getErrors('test').hasError )
	console.log('is valid with strick false', getErrors('test', { strict: false }).hasError )

	// strict false bring all the errors that they key is included @default true
	// includeKey includes key @default true
	// onlyTouched includes key @default false

	/* const arr: any = []; 

	arr.test = 10;

	// Trazer um array com todos os errors
	// Trazer um object com os errors dos filhos
	// Return boolean?

	getErrors('test') 
	// []
	getErrors('test[0].test') 
	// ['RAFAEL']
	getErrors('test', { strict: false }) 
	// ['RAFAEL'] && {
	//		'test[0].test': ['RAFAEL']
	// }
	getErrors('test[0].test') 
	// ['RAFAEL'] && {}

	console.log('errors', errors)
	getErrors('test') // {}
	getErrors('test', { strict: false }) 
	// { 'test[0].test': ['RAFAEL'] }
	getErrors('test', { strict: false, includeKey: false }) 
	// { '[0].test': ['RAFAEL'] }
	getErrors('test[0]') 
	// {}
	getErrors('test[0]', { strict: false }) 
	// { 'test': ['RAFAEL'] }

	getFormErrors('test')
	// { "": ['RAFAEL'] }
	getFormErrors('test[0]')
	// { test: ['RAFAEL'] }

	getFormErrors('list')
	// { "[0]": ['RAFAEL'] }
	getFormErrors('list[0]')
	// { "": ['RAFAEL'] } */

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
