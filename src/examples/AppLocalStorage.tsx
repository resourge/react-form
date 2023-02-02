/* eslint-disable react/no-multi-comp */
import React, { useEffect, useState } from 'react';

import {
	Controller,
	FormKey,
	FormProvider,
	useFormSplitter,
	useFormStorage,
	PreserveClass
} from '../lib'

type Props = {
	KeyName: FormKey<AppTest>
}

const CustomElement: React.FC = () => {
	return (
		<div>
			{ Math.random() }
			{' '}
		</div>
	);
};

const FormSplitterExample: React.FC = () => {
	const { form } = useFormSplitter<AppTest, 'alfredo'>('alfredo');

	return (
		<div>
			{
				form.map((_, index) => (
					<CustomElement key={`a_${index}`} />
				))
			}
		</div>
	);
};

const ControllerFormSplitterExample: React.FC<Props> = ({ KeyName }: Props) => {
	const {
		form,
		errors,
		isValid,
		isTouched,
		handleSubmit,
		triggerChange
	} = useFormSplitter<AppTest, any>();

	return (
		<>
			<button
				onClick={() => {
					triggerChange((form, setFormParent) => {
						setFormParent(Math.random() * 10);
						console.log('form', form)
					})
				}}
			>
				Test
			</button>
			<tr>
				<td>
					Form:
				</td>
				<td>
					{ JSON.stringify(form, null, 4) }
				</td>
			</tr>
			<tr>
				<td>
					Errors:
				</td>
				<td>
					{ JSON.stringify(errors, null, 4) }
				</td>
			</tr>
			<tr>
				<td>
					isValid:
				</td>
				<td>
					{ isValid.toString() }
				</td>
			</tr>
			<tr>
				<td>
					isTouched:
				</td>
				<td>
					{ isTouched.toString() }
				</td>
			</tr>
			<tr>
				<td>
					Submit:
				</td>
				<td>
					<button 
						onClick={
							(e) => {
								handleSubmit((form) => {
								// console.log('KeyName, form', KeyName, form)
								})(e)
							}
							
						}
					>
						Submit
					</button>
				</td>
			</tr>
		</>
	);
};

@PreserveClass
class Test32 {
	public arrTest32 = [];

	public Test32() {

	}
}

@PreserveClass
class Test {
	public test100 = new Test32();

	public test10 = '10'

	public doSomething() {

	}
}

@PreserveClass
class AppTest {
	public rafael: number = 10;
	public jose: number[] = [];
	public alfredo = Array.from({
		length: 1000 
	})
	.map(() => ({
		zordon: Math.random()
	}));

	public test = {
		subTest: 1
	};

	public test1 = new Test();

	public classArrayTest = []

	public test2?: Test;
}

function App() {
	const [randomNumber, setRandomNumber] = useState(Math.random())

	const {
		form,
		touches,
		errors,
		isTouched,
		isValid,
		context,

		changeValue,
		triggerChange,
		field,
		watch,
		reset,
		handleSubmit
	} = useFormStorage<AppTest>(
		AppTest,
		{
			uniqueId: 'something',
			validate: () => {
				throw new Error()
			},
			onErrors: () => {
				return [
					{
						path: 'rafael',
						errors: ['error']
					},
					{
						path: 'jose',
						errors: ['error']
					},
					{
						path: 'alfredo[1]',
						errors: ['[0] error']
					},
					{
						path: `alfredo[${Math.random() * 10}].zordon`,
						errors: ['zordon error']
					}
				]
			}
		}
	)

	console.log('form', form)

	const submit = handleSubmit((form) => {
		// console.log('form', form)
	})

	watch('jose', async (form) => {
		await Promise.resolve();
		// console.log('Watch jose')
		form.alfredo = [{
			zordon: 10
		}];

		form.jose = [Math.random()];
	})

	watch('alfredo', (form) => {
		// console.log('Watch alfredo')
	})

	watch('alfredo[0].zordon', (form) => {
		// console.log('Watch alfredo[0]')
	})

	watch('submit', (form) => {
		// console.log('Submit 1')
		// console.log('Watch alfredo[0]')
	})

	watch('submit', (form) => {
		// console.log('Submit 2')
		// console.log('Watch alfredo[0]')
	})

	useEffect(() => {
		setRandomNumber(Math.random())
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.alfredo[0]])

	/*
	console.log('formState.alfredo[0].zordon.isTouched', formState.alfredo[0].zordon.isTouched)
	console.log('formState.alfredo[0].zordon.isValid', formState.alfredo[0].zordon.isValid)
	console.log('formState.alfredo[0].zordon.errors', formState.alfredo[0].zordon.errors)
*/
	return (
		<FormProvider context={context}>
			<div>
				<button 
					onClick={submit}
				>
					Submit
				</button>
				<button onClick={() => {
					setRandomNumber(Math.random())
				}}
				>
					{ randomNumber }
				</button>
				<button onClick={() => {
					changeValue('rafael', Math.random())
				}}
				>
					Update Rafael
				</button>
				<button onClick={() => {
					changeValue('jose', [Math.random() as unknown as any])
				}}
				>
					Update Jose
				</button>
				<button onClick={() => {
					triggerChange((form) => {
						form.alfredo[0].zordon = Math.random()
					})
				}}
				>
					Update Alfredo
				</button>
				<button onClick={() => {
					triggerChange((form) => {
						form.alfredo = Array.from({
							length: 1000 
						})
						.map(() => ({
							zordon: Math.random()
						}))
					})
				}}
				>
					Change Alfredo
				</button>
				<button onClick={() => {
					reset({
						rafael: 10,
						jose: [],
						alfredo: Array.from({
							length: 1000 
						})
						.map(() => ({
							zordon: Math.random()
						}))
					})
				}}
				>
					Reset Rafael
				</button>
				<input { ...field('rafael')} />
				<textarea { ...field('rafael')}/>
				<input { ...field('rafael')} />
				<table>
					<tbody>
						<tr>
							<td>
								Touches:
							</td>
							<td>
								{ JSON.stringify(touches, null, 4) }
							</td>
						</tr>
						<tr>
							<td>
								Errors:
							</td>
							<td>
								{ JSON.stringify(errors, null, 4) }
							</td>
						</tr>
						<tr>
							<td>
								isValid:
							</td>
							<td>
								{ isValid.toString() }
							</td>
						</tr>
						<tr>
							<td>
								isTouched:
							</td>
							<td>
								{ isTouched.toString() }
							</td>
						</tr>
						{
							Object.keys(form)
							.map((key, index) => (
								<tr key={`${key}${index}`}>
									<td>
										{key}
										:
									</td>
									<td>
										<table>
											<tbody>
												<Controller
													key={`a_${index}`} 
													context={context}
													name={key as FormKey<AppTest>}
												>
													<ControllerFormSplitterExample 
														KeyName={key as FormKey<AppTest>}
													/>
												</Controller>
											</tbody>
										</table>
									</td>
								</tr>
							))
						}
					</tbody>
				</table>
				<FormSplitterExample />
			</div>
		</FormProvider>
	)
}

export default App
