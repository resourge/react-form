export type ValidationError = {
	error: string
	path: string
};

export type ValidationErrors = ValidationError[];

export type OnErrors = (errors: any | any[]) => ValidationErrors;
