export type SerializePrototypeType = {
	[K: string]: string
	Array: 'Array'
	BigInt: 'BigInt'
	Date: 'Date'
	Error: 'Error'
	Map: 'Map'
	Object: 'Object'
	RegExp: 'RegExp'
	Repeat: 'Repeat'
	Set: 'Set'
	Url: 'Url'
}

export const SerializePrototypes: SerializePrototypeType = {
	Date: 'Date',
	BigInt: 'BigInt',
	RegExp: 'RegExp',
	Url: 'Url',
	Set: 'Set',
	Map: 'Map',
	Object: 'Object',
	Array: 'Array',
	Repeat: 'Repeat',
	Error: 'Error'
};
