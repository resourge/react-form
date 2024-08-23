export type ValidationError = {
	error: string
	path: string
};
export type ValidationWithErrors = {
	errors: string[]
	path: string
};

export type ValidationErrors = Array<ValidationError | ValidationWithErrors>;

export type OnErrors = (errors: any | any[]) => ValidationErrors;
