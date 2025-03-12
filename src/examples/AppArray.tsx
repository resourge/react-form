import { Controller, useForm } from 'src/lib';

const a = Array.from({
	length: 5
})
.map(() => Math.random());

function App() {
	const {
		form,
		errors,
		isTouched,
		isValid,
		context,
		getErrors,
		hasError,

		changeValue,
		field,
		watch,
		reset,
		handleSubmit,
		getValue,
		onChange,
		resetTouch,
		setError,
		updateController,
		hasTouch
	} = useForm(
		{
			rafael: '10',
			jose: [1, 2, 3, 4, 5, 6, 7] as number[],
			alfredo: Array.from({
				length: 10
			})
			.map((_, index) => !index ? 1 : index )
			.reverse(),
			test: {
				subTest: new Date()
			},
			arr: [[1, 2], [3, 4]],
			b: [
				{
					id: 9,
					value: 'I' 
				},
				{
					id: 10,
					value: 'J' 
				},
				{
					id: 11,
					value: 'K' 
				},
				{
					id: 6,
					value: 'F'
				},
				{
					id: 6,
					value: 'F'
				},
				{
					id: 6,
					value: 'F'
				},
				{
					id: 7,
					value: 'G' 
				},
				{
					id: 8,
					value: 'H' 
				}
			]
		},
		{
			validate: (form) => {
				const errors = [
					{
						path: 'jose',
						errors: ['error']
					},
					...form.alfredo
					.map((value, index) => ({
						path: `alfredo[${index}]`,
						errors: value !== '10' || value !== 10 ? ['zordon error'] : []
					}))
				];

				if ( form.rafael !== 10 ) {
					errors.push({
						path: 'rafael',
						errors: ['error']
					});
				}

				return errors;
			},
			validationType: 'onSubmit'
		}
	);

	/*

Controller
							key={String(index)}
							context={context}
							name={`alfredo[${index}]`}
						
	*/

	return (
		<div>
			<input
				{...field('rafael')}
				type="text"
			/>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column'
				}}
			>
				{
					form.alfredo.map((_, index) => (
						<Controller
							key={`${index}`}
							context={context}
							name={`alfredo[${index}]`}
						>
							<div
								style={{
									display: 'flex'
								}}
							>
								<input
									{...field(`alfredo[${index}]`)}
									placeholder={`alfredo[${index}]`}
									type="number"
								/>
								{ getValue(`alfredo[${index}]`)?.toString() }
								<button
									onClick={() => {
										form.alfredo.splice(index, 1);
									}}
								>
									X
								</button>
							</div>
							{ getErrors(`alfredo[${index}]`) }
							{ getErrors(`alfredo[${index}]`) }
						</Controller>
					))
				}
			</div>
			<button
				onClick={() => {
					form.test.subTest.setFullYear(2000);
				}}
			>
				Change date
			</button>
			<div>
				<button
					onClick={() => {
						form.alfredo.push(0);
					}}
				>
					Add Alfredo
				</button>
				<button
					onClick={() => {
						form.alfredo[3] = 1;
					}}
				>
					QWE Alfredo X
				</button>
				<button
					onClick={() => {
						form.alfredo.splice(1, 0, 0, 0);
					}}
				>
					Splice Alfredo x
				</button>
				<button
					onClick={() => {
						form.alfredo.pop();
					}}
				>
					Pop Alfredo X
				</button>
				<button
					onClick={() => {
						form.alfredo.reverse();
					}}
				>
					Reverse X
				</button>
				<button
					onClick={() => {
						form.alfredo.fill(0, 0, 10);
					}}
				>
					fill X
				</button>
				<button
					onClick={() => {
						form.alfredo.shift();
					}}
				>
					shift X
				</button>
				<button
					onClick={() => {
						console.log(' 	form.b', form.b);
						
						form.b.fill({
							id: 6,
							value: 'F' 
						}, 3, 4);

						form.b[0].id = 10;

						console.log(' 	form.b', form.b);

						updateController('b[3]');
						updateController('b[4]');
						updateController('b[5]');

						console.log(' result.current.form.array', 
							form.b.map((_, index) => 
								hasTouch(`b[${index}]`)
							)
						);

						form.b.sort((a, b) => a.id - b.id);

						console.log(' result.current.form.array', 
							form.b.map((_, index) => 
								hasTouch(`b[${index}]`)
							)
						);
					}}
				>
					fill to sort
				</button>
				<button
					onClick={() => {
						form.alfredo.sort((a, b) => a - b);
					}}
				>
					sort
				</button>
				<button
					onClick={() => {
						form.alfredo.splice(1, 1);
						console.log('<--------------------------------------------->');
						// await (new Promise((resolve) => setTimeout(resolve, 100)));
						
						form.alfredo.reverse();

						// console.log('form.alfredo', form.alfredo);
					}}
				>
					splice reverse
				</button>
				<button
					onClick={() => {
						form.alfredo = form.alfredo
						.sort((a, b) => a - b)
						.map((a) => a);

						// console.log('form.alfredo', form.alfredo);
					}}
				>
					sort map
				</button>
				<button
					onClick={() => {
						form.alfredo.sort((a, b) => a - b);
						console.log('<--------------------------------------------->');
						// await (new Promise((resolve) => setTimeout(resolve, 100)));
						
						form.alfredo.reverse();

						// console.log('form.alfredo', form.alfredo);
					}}
				>
					sort reverse
				</button>
				<button
					onClick={() => {
						form.alfredo = Array.from({
							length: 10
						})
						.map(() => Math.random());
					}}
				>
					Map
				</button>
			</div>
			<button
				onClick={() => {
					form.rafael;
				}}
			>
				Get
			</button>
			<button
				onClick={() => {
					reset({
						rafael: 11,
						jose: [1],
						alfredo: Array.from({
							length: 10
						})
						.map(() => Math.random() ),
						test: {
							subTest: new Date()
						}
					});
				}}
			>
				Reset
			</button>
			<button
				onClick={async () => {
					await (handleSubmit((form) => {
					})());
					// TODO
					form.alfredo.push(0);
				}}
			>
				Submit and add
			</button>

			<button
				onClick={() => {
					form.arr[0][1] = 5;
					console.log('proxy.arr[0][1]', form.arr[0][1]);
				}}
			>
				Arr
			</button>

			<button
				onClick={() => {
					form.arr['[0][1]'] = 5;
					console.log('proxy.arr[0][1]', form.arr[0][1]);
				}}
			>
				Arr string
			</button>
			<button
				onClick={() => {
					form.arr
					.forEach((value) => {
					});
				}}
			>
				forEach Arr
			</button>
			<button
				onClick={() => {
					form.alfredo
					.forEach((value) => {
						value = 10;
						console.log('yrtyrtrtr', value);
					});
				}}
			>
				Foreach
			</button>
			App
		</div>
	);
}

export default App;
