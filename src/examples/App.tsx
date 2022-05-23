import React, { useEffect, useState } from 'react';

import { Controller, useForm } from '../lib'

type Props = {
	errors: string[]
	isValid: boolean
	isTouched: boolean
}

const Custom: React.FC<Props> = ({ 
	errors,
	isValid,
	isTouched
}: Props) => {
	return (
		<>
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
		</>
	);
};

const CustomElement: React.FC = () => {
	return (
		<div>{ Math.random() } </div>
	);
};

function App() {
	const [randomNumber, setRandomNumber] = useState(Math.random())
	const {
		form,
		touches,
		formState,
		context,

		changeValue,
		triggerChange,
		field
	} = useForm<{
		rafael: number
		jose: number[]
		alfredo: Array<{
			zordon: number
		}>
	}>(
		{
			rafael: 10,
			jose: [],
			alfredo: Array.from({ length: 1000 }).map(() => ({
				zordon: Math.random()
			}))
		},
		{
			validateDefault: true,
			validate: () => {
				throw new Error();
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
		<div>
			<button onClick={() => {
				setRandomNumber(Math.random())
			}}>
				{ randomNumber }
			</button>
			<button onClick={() => {
				changeValue('rafael', Math.random())
			}}>
				Update Rafael
			</button>
			<button onClick={() => {
				changeValue('jose', [Math.random() as unknown as any])
			}}>
				Update Jose
			</button>
			<button onClick={() => {
				triggerChange((form) => {
					form.alfredo[0].zordon = Math.random()
				})
			}}>
				Update Alfredo
			</button>
			<button onClick={() => {
				triggerChange((form) => {
					form.alfredo = Array.from({ length: 1000 }).map(() => ({
						zordon: Math.random()
					}))
				})
			}}>
				Reset Alfredo
			</button>
			<input { ...field('rafael', { onChange: (e) => e.target.value })} />
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
							{ JSON.stringify(formState.errors, null, 4) }
						</td>
					</tr>
					<tr>
						<td>
							isValid:
						</td>
						<td>
							{ formState.isValid.toString() }
						</td>
					</tr>
					<tr>
						<td>
							isTouched:
						</td>
						<td>
							{ formState.isTouched.toString() }
						</td>
					</tr>
					{
						Object.keys(form)
						.map((key, index) => (
							<tr key={`${key}${index}`}>
								<td>
									{key}:
								</td>
								<td>
									<table>
										<tbody>
											<Custom 
												errors={(formState as any)[key].errors}
												isValid={(formState as any)[key].isValid}
												isTouched={(formState as any)[key].isTouched}
											/>
										</tbody>
									</table>
								</td>
							</tr>
						))
					}
				</tbody>
			</table>
			<div>
				{
					form.alfredo.map((_, index) => (
						<Controller
							key={`a_${index}`}
							context={context}
							name={`alfredo[${index}]`}
						>
							<CustomElement 
						
							/>
						</Controller>
					))
				}
			</div>
		</div>
	)
}

export default App
