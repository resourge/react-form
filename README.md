# React Form

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Description

`react-form` is a simple and basic controlled hook form. Aiming to create forms with minimal effort.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

To install use npm:

```sh
npm install @resourge/react-form
```

or with Yarn:

```sh
yarn add @resourge/react-form
```


## Features

- Controlled form.
- Possibility of using `class` as default form data (see more [Form Data](#form-data)).
- No native validation. The entire validation is up to the developer.
- Simple to use with existing HTML form inputs and 3rd-party UI libraries.
- Build with typescript.
- Easy to use in react and react-native.
- Possibility to "split" the form (having the same form, but validating specific sections (commonly used with form sections)).
- "useFormStorage" for it to automatically save on a specific storage (ex: localStorage).


## Usage

```jsx
import { useForm } from '@resourge/react-form'

function App() {
  const {
    form,
    isTouched,
    isValid,
    field,
    handleSubmit
  } = useForm(
    {
      productName: ''
    },
    {
      // Form validation
      // @resourge/schema recommended use
      validate: () => []
    }
  )
  
  const onSubmit = handleSubmit((form) => {
    console.log('form', form)
    // Send it to backend
  })
  
  return (
    <div>
      <button 
        onClick={onSubmit}
      >
        Submit
      </button>
      <div>
        <label>
          Product Name
        </label>
        <input { ...field('productName')} />
      </div>
    </div>
  )
}
```

## Form Default values

Default form values can be a simple object or a class.

Rules:

* Only constrains `Form Data` to an object. Meaning that it's possible to have elements with `moment`, `dayjs`, `class's`, `luxonas`, etc.
* Cached on the first render (changes will not affect the form data.)


```Typescript
// object
const { ... } = useForm(
  {
    productName: ''
  }
)

// class

// For class without constructor or constructor with undefined params
class Product {
	public productName = '';
}
const { ... } = useForm(
  Product
)

// For class with constructor or constructor with params
class ProductWithConstructor {
	public productName = '';

	constructor(productName: string) {
		this.productName = productName;
	}
}
const { ... } = useForm(
  () => new ProductWithConstructor('Apple')
)
```

## Form Options

```Typescript
// object
const { ... } = useForm(
  ...,
  {
	// Not required
	validate: (form, changedKeys) => [],
	onErrors: (errors) => errors,
	validateDefault: true,
	validateOnlyAfterFirstSubmit: false,
	onlyOnTouchDefault: true,
	onChange: (formState) => { },
	onSubmit: (formState) => { },
	onTouch: (key, value, previousValue) => { }
  }
)
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| **validate** | `(form, changedKeys) => void \| ValidationErrors \| Promise<void> \| Promise<ValidationErrors>` | Method to validate form. Usually with some kind of validator. (like yup, zod, joi, @resourge/schema(Recommended), etc) |
| **onErrors** | `(errors: any \| any[]) => FormErrors` | Method to treat errors. |
| **validateDefault** | `boolean` | Set's global validation. true by default |
| **validateOnlyAfterFirstSubmit** | `boolean` | Set's global validation to only after first submit. true by default |
| **onlyOnTouchDefault** | `boolean` | Set's globally to only show errors on camp touch. True by default |
| **onChange** | `(formState) => void` | Called on every form change |
| **onSubmit** | `(formState) => void` | Called on form submission |
| **onTouch** | `(key, value, previousValue) => void` | Method called every time a value is changed |

## Form actions

```Typescript
// object
const {
  form,
  touches, isTouched,
  errors, isValid,
  context,

  field, getValue,

  triggerChange, reset, onChange, changeValue, 
  
  handleSubmit,

  getErrors, hasError, setError,

  watch,
  
  resetTouch,
  
  updateController
} = useForm( ... )
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| **form** | `object \| class` | [`formData`](#form-data) |
| **touches** | `{ [form path]: boolean }` | Form touches (ex: { 'user.name': true }) |
| **isTouched** | `boolean` | Form touches state by default is false if `touches` are undefined or an empty object |
| **errors** | `{ [form path]: [path error messages] }` | Depends if `useForm` `validate` is set. (ex: { 'user.name': ['Name is required'] }) |
| **isValid** | `boolean` | Form state by default is false if `errors` are undefined or an empty object |
| **context** | `object` | Context, mainly for use in `FormProvider` |

## `field`

Method to connect the form element to the key by providing native attributes like `onChange`, `name`, etc

```JSX
const {
  field
} = useForm(
  {
    name: 'Rimuru'
  }
)

<input {...field('name')} />

<input 
  { ...field('name', { 
      blur: false,
      readOnly: false,
      filterKeysError: () => false,
      forceValidation: false,
      onChange: () => {},
      triggerTouched: true,
      validate: true
    })
  } 
/>
```

## Field options

_Note: Field options are not mandatory or necessary, they are optional_

| Name | Type | Default | Description |
| ---- | ---- | ---- | ----------- |
| **blur** | `boolean` | false | Turns the field from a onChange to onBlur |
| **filterKeysError** | `(key: string) => boolean` | undefined | Method to make sure some keys are not triggering errors |
| **forceValidation** | `boolean` | false | Forces form validation regardless of conditions |
| **onChange** | `(value: Value) => any` | undefined | Changes the value on change. |
| **readOnly** | `boolean` | false | Turns the field from a onChange to readonly |
| **triggerTouched** | `boolean` | true | If `false` will not check `touches` and not call `onTouch` from options |
| **validate** | `boolean` | true | Validates form if new form values are different from previous form values |

## `getValue`

Return the value for the matched key

```Typescript
const {
  getValue
} = useForm(
  {
    name: 'Rimuru'
  }
)

getValue('name') /// Rimuru
```

## `triggerChange`

Method to make multiple changes in one render

```Typescript
const {
  triggerChange
} = useForm(
  ...
)

triggerChange((form) => {
  form.name = 'Rimuru';
  form.age = '39';
  ...
})

triggerChange((form) => {}, { 
  filterKeysError: (key) => false,
  forceValidation: false,
  triggerTouched: true,
  validate: true
})
```

## Field options

_Note: Field options are not mandatory or necessary, they are optional_

| Name | Type | Default | Description |
| ---- | ---- | ---- | ----------- |
| **filterKeysError** | `(key: string) => boolean` | undefined | Method to make sure some keys are not triggering errors |
| **forceValidation** | `boolean` | false | Forces form validation regardless of conditions |
| **triggerTouched** | `boolean` | true | If `false` will not check `touches` and not call `onTouch` from options |
| **validate** | `boolean` | true | Validates form if new form values are different from previous form values |

## `reset`

Resets form state

```Typescript
const {
  reset
} = useForm(
  {
    name: 'Rimuru'
  }
)
...
reset({
  name: 'Rimuru Tempest'
})

reset({ ... }, {
  filterKeysError: (key) => false,
  forceValidation: false,
  triggerTouched: true,
  validate: true,
  clearTouched: true
})
```

## Field options

_Note: Field options are not mandatory or necessary, they are optional_

| Name | Type | Default | Description |
| ---- | ---- | ---- | ----------- |
| **filterKeysError** | `(key: string) => boolean` | undefined | Method to make sure some keys are not triggering errors |
| **forceValidation** | `boolean` | false | Forces form validation regardless of conditions |
| **triggerTouched** | `boolean` | true | If `false` will not check `touches` and not call `onTouch` from options |
| **validate** | `boolean` | true | Validates form if new form values are different from previous form values |
| **clearTouched** | `boolean` | true | On reset, `touches` will be cleared |

## `onChange`

Returns a method to change key value

```Typescript
const {
  onChange
} = useForm(
  {
    name: 'Rimuru'
  }
)
...
onChange('name')

<input onChange={onChange('name')} />

onChange('name', { 
  blur: false,
  readOnly: false,
  filterKeysError: () => false,
  forceValidation: false,
  onChange: () => {},
  triggerTouched: true,
  validate: true
})
```

## Field options

_Note: Field options are not mandatory or necessary, they are optional_

| Name | Type | Default | Description |
| ---- | ---- | ---- | ----------- |
| **blur** | `boolean` | false | Turns the field from a onChange to onBlur |
| **filterKeysError** | `(key: string) => boolean` | undefined | Method to make sure some keys are not triggering errors |
| **forceValidation** | `boolean` | false | Forces form validation regardless of conditions |
| **onChange** | `(value: Value) => any` | undefined | Changes the value on change. |
| **readOnly** | `boolean` | false | Turns the field from a onChange to readonly |
| **triggerTouched** | `boolean` | true | If `false` will not check `touches` and not call `onTouch` from options |
| **validate** | `boolean` | true | Validates form if new form values are different from previous form values |

## `changeValue`

Simplified version of `onChange`, without the return method

```Typescript
const {
  changeValue
} = useForm(
  {
    name: 'Rimuru',
    age: '40'
  }
)
...
changeValue('name', 'Rimuru Tempest')

changeValue('name', 'Rimuru Tempest', { 
  blur: false,
  readOnly: false,
  filterKeysError: () => false,
  forceValidation: false,
  onChange: () => {},
  triggerTouched: true,
  validate: true
})
```

## Field options

_Note: Field options are not mandatory or necessary, they are optional_

| Name | Type | Default | Description |
| ---- | ---- | ---- | ----------- |
| **blur** | `boolean` | false | Turns the field from a onChange to onBlur |
| **filterKeysError** | `(key: string) => boolean` | undefined | Method to make sure some keys are not triggering errors |
| **forceValidation** | `boolean` | false | Forces form validation regardless of conditions |
| **onChange** | `(value: Value) => any` | undefined | Changes the value on change. |
| **readOnly** | `boolean` | false | Turns the field from a onChange to readonly |
| **triggerTouched** | `boolean` | true | If `false` will not check `touches` and not call `onTouch` from options |
| **validate** | `boolean` | true | Validates form if new form values are different from previous form values |

## `handleSubmit`

Method to handle form submission

```Typescript
const onSubmit = handleSubmit((form) => {
  /// Will only be called when form is valid
  /// do something with it
})

const onSubmit = handleSubmit(
  (form) => {
    /// Will always be called 
    /// because the next method returns true
    /// do something with it
  },
  (errors) => true 
)
```

## `getErrors`

Returns error messages for the matched key

```Typescript
const {
  getErrors
} = useForm(
  {
    product: {
      name: 'Apple',
      category: {
        name: 'Food',
        type: {
          name: 'Solid',
          type: 'Vegetal'
        }
      }
    }
  },
  {
	validate: () => {
		// Returned errors are going to be show in getErrors
		return []
	}
  }
)

getErrors('product.category') /// [<<Error Messages>>]
getErrors('product.category.type.name') /// [<<Error Messages>>]

getErrors('product.category.type.name', {
  includeChildsIntoArray: true,
  includeKeyInChildErrors: false,
  onlyOnTouch: true,
  onlyOnTouchKeys: undefined,
  strict: true
})
```

## Field options

_Note: Field options are not mandatory or necessary, they are optional_

| Name | Type | Default | Description |
| ---- | ---- | ---- | ----------- |
| **includeChildsIntoArray** | `boolean` | true | Includes the children errors on the array |
| **includeKeyInChildErrors** | `boolean` | false | Includes `key` in children paths |
| **onlyOnTouch** | `boolean` | true |  When true only returns if the key was `touched` |
| **onlyOnTouchKeys** | ` Array<FormKey<T>>` | undefined | Array containing other keys to also validate on touch |
| **strict** | `boolean` | true | Includes children errors as objects into array. _Note: If `includeChildsIntoArray` is true `strict` will by default be false_ |

## `hasError`

Returns a boolean for the matched key

```Typescript
const {
  hasError
} = useForm(
  {
    product: {
      name: 'Apple',
      category: {
        name: 'Food',
        type: {
          name: 'Solid',
          type: 'Vegetal'
        }
      }
    }
  },
  {
	validate: () => {
		// Returned errors are defined if hasError is true or false
		return []
	}
  }
)

hasError('product.category') // returns true or false
hasError('product.category.type.name') // returns true or false
```

## Field options

_Note: Field options are not mandatory or necessary, they are optional_

| Name | Type | Default | Description |
| ---- | ---- | ---- | ----------- |
| **onlyOnTouch** | `boolean` | true |  When true only returns if the key was `touched` |
| **onlyOnTouchKeys** | ` Array<FormKey<T>>` | undefined | Array containing other keys to also validate on touch |
| **strict** | `boolean` | true | Includes children errors to define if is true or false. _Note: If `includeChildsIntoArray` is true `strict` will by default be false_ |

## `setError`

Method to set custom errors

```Typescript
const {
  setError
} = useForm(
  {
    name: 'Rimuru'
  }
)

setError([
  {
    key: 'name',
    message: 'Beautiful name'
  }
])
```

## `watch`

- After all changes are done, it will execute all "watched keys" methods.
- Watch key, then executes the method to update itself or others values.
- Watch 'submit' to execute when the form is submitted.

```Typescript
const {
  watch
} = useForm(
  {
    name: 'Rimuru'
  }
)

// When 'name' is `touched` it will update again with the new name
// It does not rerender again, its a one time deal for every watch
// Order is important as well, as it will be executed by order in render
watch('name', (form) => {
  form.name = 'Rimuru Tempest';
})
// When form is submitted
watch('submit', (form) => {
})
```

## `resetTouch`

Clears touch's

```Typescript
const {
  resetTouch
} = useForm(
  ...
)
...
resetTouch()
```

## `updateController`

Forces update controllers with key

```JSX
const {
  context,
  updateController
} = useForm({
  keyElementOfForm: 'Rimuru'
})

updateController("keyElementOfForm")

<Controller
	context={context}
	name="keyElementOfForm"
>
  {...}
<Controller>
```

## Form Provider and useFormContext

Instead of inserting props in child components, FormProvider will create a context and a hook to access the form anywhere inside.

```jsx
import React from 'react';
import { FormProvider, useForm, useFormContext } from '@resourge/react-form'

export function CustomElement() {
  const { form, isValid, field } = useFormContext()

  return (
    <>
      <span>
      {
        isValid ? "Valid" : "Invalid" 
      } CustomElement
      </span>
      <input {...field('customElement')} />
    </>
  )
}

export function App() {
  const {
    context
  } = useForm( ... )

  return (
    <FormProvider context={context}>
      <CustomElement />
      ...
    </FormProvider>
  )
}
```

## Advanced usage

```jsx
import { useForm } from '@resourge/react-form'

function App() {
  const {
    form,
    isTouched,
    isValid,
    field,
    handleSubmit,
	getErrors,
	triggerChange,
	watch
  } = useForm(
    {
      productName: '',
	  category: {
		name: '',
		type: ''
	  },
	  listOfOptions1: [
		{
			label: 'Option 1.1',
			value: 1.1
		},
		{
			label: 'Option 1.2',
			value: 1.2
		}
	  ],
	  option1: undefined,
	  listOfOptions2: [],
	  option2: undefined,
    },
    {
      // Form validation
      // @resourge/schema recommended use
      validate: () => []
    }
  )

  watch('option1', async (form) => {
	// make a request to the BD or something, can use form.option1
	const listOfOptions2 = await Promise.resolve([
		{
			label: 'Option 2.1',
			value: 2.1
		},
		{
			label: 'Option 2.2',
			value: 2.2
		}
	]) 
	form.listOfOptions2 = listOfOptions2
  })
  
  const onSubmit = handleSubmit((form) => {
    console.log('form', form)
    // Send it to backend
  })
  
  return (
    <div>
      <button 
        onClick={onSubmit}
      >
        Submit
      </button>
      <div>
        <label>
          Product Name
        </label>
        <input { ...field('productName')} /> <br />
		<ul>
		  {
		    getErrors('productName').map((message) => (
		      <li>{ message }</li>
		    ))
		  }
		</ul>
        <input { ...field('category.name')} /> <br />
		<ul>
		  {
		    getErrors('productName').map((message) => (
		      <li>{ message }</li>
		    ))
		  }
		</ul>
        <input { ...field('category.type')} /> <br />
		<ul>
		  {
		    getErrors('productName').map((message) => (
		      <li>{ message }</li>
		    ))
		  }
		</ul> <br />
		<select name="option1" {...field('option1')}>
			{
				form.listOfOptions1.map((option1) => (
					<option value={option1.value}>{ option1.label }</option>
				))
			}
		</select> <br />
		<select name="option2" {...field('option2')}>
			{
				form.listOfOptions2.map((option2) => (
					<option value={option2.value}>{ option2.label }</option>
				))
			}
		</select> <br />
		<button 
			onClick={() => {
				triggerChange((form) => {
					form.category = {
						name: 'Apple',
						type: 'Food'
					}
				})
			}}
		>
			Default category
		</button>
      </div>
    </div>
  )
}
```

## useFormSplitter

Hook to create a sub-form. Serves to basically create a sub form for the specific "formFieldKey", where all validations, forms and methods will be specific to the "formFieldKey" selected. (Works basically like a specific useForm for that "formFieldKey")


```jsx
import React from 'react';
import { useFormSplitter, useForm, Controller } from '@resourge/react-form'

function CustomElement({ index, value }: { index, value: number }) {
  const { 
	form, // Will only be related to the `list[${index}]`
	errors, // Will only be related to the `list[${index}]`
	isValid, // Will only be related to the `list[${index}]`
	isTouched, // Will only be related to the `list[${index}]`
	handleSubmit // Will only be related to the `list[${index}]`, meaning it will only trigger if `list[${index}]` is valid

	// When used inside a Controller component, its not necessary to add a key
  } = useFormSplitter()
  // otherwise its necessary to add a key
  // } = useFormSplitter(`list[${index}]`)

  return (
	<table>
	  <tbody>
        <tr>
          <td>
            Form:
          </td>
          <td>
            { JSON.stringify(form, null, 4) }
          </td>
		</tr>
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
		<tr>
          <td>
            Submit:
          </td>
          <td>
            <button 
              onClick={
                handleSubmit((form) => {
                  // console.log('KeyName, form', KeyName, form)
                })
              }
            >
              Submit
            </button>
          </td>
        </tr>
	  </tbody>
	</table>
  )
}

export function App() {
  const {
    context,
    form
  } = useForm({
    list: Array.from({ length: 1000 }).map((_, index) => index + 1)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {
        form.list.map((value, index) => (
          <Controller
            key={`${index}`}
            name={`list[${index}]`}
            context={context}
          >
            <CustomElement value={value} />
          </Controller>
        ))
      }
    </div>
  )
}
```

## useFormStorage

Hook to create a form where changes will be saved in a storage. <br/>
_Note: that when changes are done to form data, it's always better to change/update the version so storage data is cleared._ <br/>
_Note: By default it will clear the form from storage when submitted with success._

## FormStorage Options

```jsx
// object
const { ... } = useForm(
  ...,
  {
	//... same as normal useForm

	// Required
	uniqueId: 'unique form id', // Mandatory so you can save multiple forms
	storage: {
	  getItem: (key) => 'return key or null',
	  removeItem: (key) => {},
	  setItem: (key, value: string) => {}
	}
	// Or storage: window.localStorage

	// NotRequired
	autoSyncWithStorage: true,
	shouldClearAfterSubmit: true,
	version: '1.0.0',
	onLoading: (isLoading) => {},
	onStorageError: (error) => {}
  }
)
```

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | -------- | ----------- |
| **uniqueId** | `string` | `true` | `undefined` | Unique id for storage |
| **storage** | `{ getItem: (key) => 'return key or null', removeItem: (key) => {}, setItem: (key, value: string) => {} }` | `true` | undefined | Storage where form is going to be saved |
| **autoSyncWithStorage** | `boolean` | `false` | `true` | When true, will automatically sync the form data with storage one |
| **shouldClearAfterSubmit** | `boolean` | `false` | `true` | Should clear storage after submit |
| **version** | `string` | `false` | `1.0.0` | Storage version (changing will clear form from storage) |
| **onLoading** | `(isLoading) => void` | `false` | `undefined` | Reading from storage can be a small delay, onLoading serves to show a loading. |
| **onStorageError** | `(error) => void` | `false` | `undefined` | In case reading or writing in storage gives an error |

## Class vs JSON

When using `useFormStorage` all data will be converted to JSON (localStorage, indexDB, etc only work with pure JSON) that means Class's prototype will be removed. To prevent this from occurring some class decorators/functions are provided.

## PreserveClass or addClassToPreserve

With Decorator:

```Typescript
@PreserveClass
class Test {
  public doSomething() {
  
  }
}

@PreserveClass
class AppTest {
  public test = {
	subTest: 1
  };

  public classTest1 = new Test();

  public classArrayTest = []

  public classTest2?: Test;
}
```

With a simple function:

```Typescript
class Test {
  public doSomething() {

  }
}
addClassToPreserve(Test)
class AppTest {
  public test = {
  	subTest: 1
  };

  public classTest1 = new Test();

  public classArrayTest = []

  public classTest2?: Test;
}
addClassToPreserve(AppTest)
```

## Controller

For more complex and deep forms, where render's can impact performance 
(like list's with multiple elements) `Controller` serves to minimize 
the impact a render can have on react, by only updating children if prop `name`
is `touched` by the form. 

_Note: Is mandatory to use useController inside components inside a Controller. Serves to maintain performance benefits._

```jsx
import React from 'react';
import { Controller, useController, useForm } from '@resourge/react-form'

function CustomElement({ value }: { value: number }) {
  const { 
    onChange
  } = useController()

  return (
    <div>
      { value } <button
        onClick={() => {
          onChange && onChange(Math.random())
        }}
      >
        Update with random value
      </button>
    </div>
  )
}

export function App() {
  const {
    context,
    form
  } = useForm({
    list: Array.from({ length: 1000 }).map((_, index) => index + 1)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {
        form.list.map((value, index) => (
          <Controller
            key={`${index}`}
            name={`list[${index}]`}
            context={context}
          >
            <CustomElement value={value} />
          </Controller>
        ))
      }
    </div>
  )
}
```

For more detailed usage instructions, refer to the [documentation](#documentation).

## Documentation

For comprehensive documentation and usage examples, visit the [React Form documentation](https://resourge.vercel.app/docs/react-form/intro).

## Contributing

Contributions to React Form are welcome! To contribute, please follow the [contributing guidelines](CONTRIBUTING.md).

## License

React Form is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, please contact the maintainers:
- GitHub: [Resourge](https://github.com/resourge)