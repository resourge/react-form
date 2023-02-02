/* eslint-disable @typescript-eslint/naming-convention */
/// <reference types="vite/client" />

declare let __DEV__: boolean;

declare module 'seri' {
	type Seri = {
		addClass: (obj: any) => void
		parse: (objSring: string) => object
		stringify: (obj: object) => string
	}

	const seri: Seri;
	export default seri;
}
