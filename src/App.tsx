/* import onChange from 'on-change';

import { observeObject } from './lib/utils/objectObject/objectObject';

// Example usage:

// Custom Class
class Person {
	constructor(name, age) {
		this.name = name;
		this.age = age;
	}

	greet() {
		console.log(`Hello, my name is ${this.name}`);
	}
}

// Circular Reference Example
const data = {
	asd: new ArrayBuffer(10),
	name: 'John',
	age: 30,
	birthday: new Date('1990-01-01'),
	address: {
		city: 'New York',
		zip: 10001,
		cate: {
			test: 10,
			test1: [
				{
					test: 10,
					test1: {
						test: 10
					}
				}
			]
		}
	},
	hobbies: ['reading', 'traveling'],
	hobbiesS: new Set(['reading', 'traveling']),
	hobbies2: new Set(['2', '2']),
	hobbiesM: new Map([['reading', 'traveling']]),
	friends: [
		{
			name: 'Alice',
			age: 25 
		},
		{
			name: 'Bob',
			age: 27 
		}
	],
	person: new Person('Alice', 25),

	file: new File([], 'test.txt')
};

// Creating a circular reference
data.self = data;

// Circular Reference Example
const data2 = {
	asd: new ArrayBuffer(10),
	name: 'John',
	age: 30,
	birthday: new Date('1990-01-01'),
	address: {
		city: 'New York',
		zip: 10001,
		cate: {
			test: 10,
			test1: [
				{
					test: 10,
					test1: {
						test: 10
					}
				}
			]
		}
	},
	hobbies: ['reading', 'traveling'],
	hobbiesS: new Set(['reading', 'traveling']),
	hobbies2: new Set(['2', '2']),
	hobbiesM: new Map([['reading', 'traveling']]),
	friends: [
		{
			name: 'Alice',
			age: 25 
		},
		{
			name: 'Bob',
			age: 27 
		}
	],
	person: new Person('Alice', 25),
	test() {
		this.friends[0].age = 30;
	},
	file: new File([], 'test.txt')
};

// Creating a circular reference
data2.self = data;

const watchedData = observeObject(
	data, 
	(prop) => {
		console.log('[Property]', prop);
	}
);

watchedData.hobbiesS.add('test');
console.log('hobbiesS', watchedData.hobbiesS);
watchedData.hobbiesS = new Set(['asd']);
watchedData.hobbiesS.add('test');
// watchedData.hobbies2.add('test2');

// watchedData.hobbiesS = new Set(['1']);
 */
function App() {
	return (
		<div>
			App
		</div>
	);
}

export default App;
