/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';

import { Controller, useForm, useFormSplitter } from './lib'

class Test {
	step1 = {
		test: 1
	}

	step2 = {
		test: 2
	}
}

const useT = () => {
	return useForm(
		Test,
		{
			validate: () => {
				return [
					{
						path: 'step2.test',
						error: 'Test'
					}
				]
			}
		}
	)
}

const Step: React.FC<{ name: string, submit: () => void }> = ({ name, submit }) => {
	const {
		form, errors, handleSubmit, getErrors, field, hasError
	} = useFormSplitter();

	console.log('form, errors', form, errors, getErrors('test'));
	
	return (
		<div>
			{ name }
			<br />
			{
				hasError('test') ? (
					<small>
						Error
						<br />
					</small>
				) : null
			}
			<input type="date" {...field('test')} />
			<button onClick={handleSubmit(submit)}>
				Handle 
				{' '}
				{ name }
			</button>
			<br />
		</div>
	);
};

function App() {
	const [step, setStep] = useState(0);
	const {
		context, form, errors, handleSubmit, getErrors 
	} = useT();

	console.log('form, errors', form, errors, getErrors('step2.test'));
	
	return (
		<div>
			<button onClick={handleSubmit(() => {})}>
				Handle All
			</button>
			<div>
				<button onClick={() => {
					setStep(0)
				}}
				>
					Step 1
				</button>
				<button onClick={() => {
					setStep(1)
				}}
				>
					Step 2
				</button>
			</div>
			<div 
				style={{
					visibility: step !== 0 ? 'hidden' : undefined
				}}
			>
				<Controller
					context={context}
					name="step1"
				>
					<Step
						name="step1"
						submit={() => {
							setStep(1) 
						}}
					/>
				</Controller>
			</div>
			<div 
				style={{
					visibility: step !== 1 ? 'hidden' : undefined
				}}
			>
				<Controller
					context={context}
					name="step2"
				>
					<Step name="step2" submit={() => {}} />
				</Controller>
			</div>
		</div>
	)
}

export default App
