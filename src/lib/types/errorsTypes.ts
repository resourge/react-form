// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type OnErrors = (errors: any | any[]) => ValidationErrors;

export type ValidationError = {
	error: string
	path: string
};

export type ValidationErrors = ValidationError[];
