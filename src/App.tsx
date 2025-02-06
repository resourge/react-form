import { useForm } from './lib';

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
		triggerChange,
		field,
		watch,
		reset,
		handleSubmit,
		getValue,
		onChange,
		resetTouch,
		setError,
		updateController
	} = useForm(
		{
			rafael: 10,
			jose: [],
			alfredo: Array.from({
				length: 5
			})
			.map(() => Math.random()),
			test: {
				subTest: new Date()
			}
		},
		{
			validate: (form) => {
				const errors = [
					{
						path: 'jose',
						errors: ['error']
					},
					...form.alfredo.map((_, index) => ({
						path: `alfredo[${index}]`,
						errors: ['zordon error']
					}))
				];

				console.log('form.rafael', form.rafael);
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

	console.log('render');

	return (
		<div>
			<input
				{...field('rafael')}
				type="number"
			/>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column'
				}}
			>
				{
					form.alfredo.map((_, index) => (
						<>
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
								<button
									onClick={() => {
										form.alfredo.splice(index, 1);
									}}
								>
									X
								</button>
							</div>
							{ getErrors(`alfredo[${index}]`) }
						</>
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
			<button
				onClick={() => {
					form.alfredo.push(0);
				}}
			>
				Add Alfredo
			</button>
			<button
				onClick={() => {
					form.alfredo[5] = 1;
				}}
			>
				QWE Alfredo
			</button>
			<button
				onClick={() => {
					form.alfredo.splice(1, 0, 0);
				}}
			>
				Splice Alfredo
			</button>
			<button
				onClick={handleSubmit(() => {})}
			>
				Submit
			</button>
			App
		</div>
	);
}

export default App;
