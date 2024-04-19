/// <reference types="vite/client" />

declare module 'seri' {
	type Seri = {
		addClass: (obj: any) => void
		parse: (objSring: string) => object
		stringify: (obj: object) => string
	};

	const seri: Seri;
	export default seri;
}
