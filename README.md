# React-Form

`react-form` is a simple and basic controlled hook form. Aiming to create forms with minimal effort.

Visit our website [resourge-react-form.netlify.app](https://resourge-react-form.netlify.app)

## Features

- Controlled form.
- Possibility of using `class` as default form data (see more [Form Data](#form-data)).
- No native validation. The entire validation is up to the developer.
- Simple to use with existing HTML form inputs and 3rd-party UI libraries.
- Build with typescript.
- Easy to use in react and react-native.


## Installation

Install using [Yarn](https://yarnpkg.com):

```sh
yarn add @resourge/react-form
```

or NPM:

```sh
npm install @resourge/react-form --save
```

## Setup Errors

To simplify the process of converting errors from validation packages like joi, yup, zod, ajv, etc to `useForm` lookalike errors, use `setDefaultOnError`.
You only need to setup this on the initialization of the application in this case App.tsx

`setDefaultOnError` will, by default (unless `onError` from [Form Options](#form-options) is set), customize the errors to fit `useForm` errors

```jsx
// In App.tsx
import { setDefaultOnError } from '@resourge/react-form'

setDefaultOnError((errors: any) => {
  // Customize errors to fit the model 
  // [{ path, errors }]
  return []
});
```

_Note: We plan to add more default validations in the future. If you have one and want to share, please do and contribute._

For yup validation, `setFormYupValidation`

```jsx
// In App.tsx
import { setFormYupValidation } from '@resourge/react-form'

setFormYupValidation();
```

## Usage

```Typescript
const {
  form, // Form Data
  touches, isTouched, // Form touches
  errors, isValid, // Form validation
  context, // Context
  triggerChange, reset, merge,
  handleSubmit, field,
  onChange, getValue, changeValue,changeValue, 
  resetTouch,
  getErrors, setError, hasError, 
  watch
} = useForm(formData, formOptions)
```

`useForm` is the hook necessary to create forms. Using [formData](#form-data) and [formOptions](#form-options), the hook returns an array containing the [form state](#form-state-and-actions) and the [form actions](#form-state-and-actions).

## Quickstart

See more at [Errors](#errors)

```jsx
import React, { useState } from 'react';
import { useForm } from '@resourge/react-form';

export default function Form() {
  const { 
    isValid,
    field, 
    handleSubmit 
  } = useForm(
    { 
      name: 'Rimuru' 
    }
  )

  const onSubmit = handleSubmit((form) => {
    ....
  })

  return (
    <form onSubmit={onSubmit}>
      <input { ...field('name') }/>
      <span>
      {
        isValid ? "Valid" : "Invalid" 
      } Form
      </span>
      <button type="submit">
        Save
      </button>
    </form>
  );
}
```

. 

_Note: `<form></form>` the usage of form as wrapper is optional._

### Form Data

Form data is the default form values. Can be a simple object or a class (I made it specifically for class support)

Rules:

* Only constrains `Form Data` to an  object. Meaning that it's possible to have elements with `moment`, `dayjs`, `class's`, `luxonas`, etc.
* Cached on the first render (changes will not affect the form data.)

```Typescript

// definition of a plain object
const user = {
    name: 'Rimuru',
    age: 39
}

// usage with an object
const {
  ...
} = useForm(
  user
)

// definition of class
class User {
  name = 'Rimuru';
  age = 39
  
  get fullName() {
    return `${this.name} Tempest`
  }
}

// usage with a class
const {
  ...
} = useForm(
  User
)
const {
  ...
} = useForm(
  () => new User()
)
```

### Form Options

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| **validateDefault** | `boolean` | false | Set's global validation. False by default |
| **onlyOnTouchDefault** | `boolean` | true | Set's globally to only show errors on camp touch. True by default |
| **validate** | `(form: T) => void \| Promise<void>` | false | Method to validate form. Usually with some kind of validator. (like yup, zod, joi, etc) |
| **onErrors** | `(errors: any \| any[]) => FormErrors` | false | Local method to treat errors. |
| **onTouch** | `(key: FormKey<T>, value: unknown, previousValue: unknown) => void` | false | Method called every time a value is changed |

## Form State and Actions

`useForm` returns `Form State` and `Form Actions` 

### Form State

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| **form** | `object` | [`formData`](#form-data) | Form data |
| **errors** | `{ [form path]: [path error messages] }` | undefined | Depends if `useForm` `validate` is set. (ex: { 'user.name': ['Name is required'] }) |
| **isValid** | `boolean` | false | Form state by default is false if `errors` are undefined or an empty object |
| **touches** | `{ [form path]: boolean }` | {} | Form touches (ex: { 'user.name': true }) |
| **isTouched** | `boolean` | false | Form touches state by default is false if `touches` are undefined or an empty object |
| **context** | `object` | [Form State](#form-state) | Context, mainly for use in `FormProvider` |


### Form Actions

#### `field`

Method to connect the form element to the key by providing native attributes like `onChange`, `name`, etc

```Typescript
const {
  field
} = useForm(
  {
    name: 'Rimuru'
  }
)

<input {...field('name')} />

/// For validating when changing the value without triggering the submit to get the error validation
<input {...field('name', { validate: true })} />
```

#### `triggerChange`

Method to make multiple changes in one render

```Typescript
const {
  triggerChange
} = useForm(
  ...
)
...
triggerChange((form) => {
  form.name = 'Rimuru';
  form.age = '39';
  ...
})
...
```

#### `handleSubmit`

Method to handle form submission

```Typescript
const onSubmit = handleSubmit((form) => {
  /// Will only be called when form is valid
  /// do something with it
})
//
const onSubmit = handleSubmit(
  (form) => {
    /// Will always be called 
    /// because the next method returns true
    /// do something with it
  },
  (errors) => true 
)
```

#### `watch`

Executes methods when "watched key" is touched

```Typescript
const {
  watch
} = useForm(
  {
    name: 'Rimuru'
  }
)
...
// When 'name' is `touched` it will update again with the new name
// It does not rerender again, its a one time deal for every watch
// Order is important as well, as it will be executed by order in render
watch('name', (form) => {
  form.name = 'Rimuru Tempest';
})
```

#### `setError`

Method to set custom errors

```Typescript
const {
  setError
} = useForm(
  {
    name: 'Rimuru'
  }
)
...
setError([
  {
    key: 'name',
    message: 'Beautiful name'
  }
])
```

#### `hasError`

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
  }
)
...
hasError('product.category') 
/// Can return (depends on the validation)
```

#### `getErrors`

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
  }
)
...
getErrors('product.category') /// [<<Error Messages>>]
```

#### `reset`

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

/// Validates new data, triggers validation
reset(
  {
    name: 'Rimuru Tempest'
  },
  {
    validate: true
  }
)
```

#### `merge`

Unlike reset, `merge` will merge a new partial form to the new form

```Typescript
const {
  merge
} = useForm(
  {
    name: 'Rimuru',
    age: '40'
  }
)
...
merge({
  age: '39'
})
```

#### `onChange`

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

/// Validates form on change
onChange('name', { validate: true })

<input onChange={onChange('name')} />
```

#### `changeValue`

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

/// Validates form on change
changeValue('name', 'Rimuru Tempest', { validate: true })
```

#### `getValue`

Return the value for the matched key

```Typescript
const {
  changeValue
} = useForm(
  {
    name: 'Rimuru'
  }
)
...
getValue('name') /// Rimuru
```

#### `resetTouch`

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

## Form Provider

For more complex and deep forms.

```jsx
import React from 'react';
import { FormProvider, useForm } from '@resourge/react-form'

export function CustomElement() {
  // field is the same as doing field('name')
  const { field, isValid } = useController()

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

## useFormSplitter

Hook to create a sub-form. Serves to basically create a sub form for the specific "formFieldKey", where all validations, forms and methods will be specific to the "formFieldKey" selected. (Works basically like a specific useForm for that "formFieldKey")


```jsx
import React from 'react';
import { Controller, useController, useForm } from '@resourge/react-form'

function CustomElement({ index, value }: { index, value: number }) {
  const { 
	form, // Will only be related to the `list[${index}]`
	errors, // Will only be related to the `list[${index}]`
	isValid, // Will only be related to the `list[${index}]`
	isTouched, // Will only be related to the `list[${index}]`
	handleSubmit // Will only be related to the `list[${index}]`, meaning it will only trigger if `list[${index}]` is valid
  } = useFormSplitter(`list[${index}]`)

  return (
    <div>
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


## useFormStorage

Hook to create a form. Works the same as useForm but when changes are done it will also saves the data in a local storage (using localForage).
_Note that when changes are done to form data, it's always better to change/update the version so local storage data is cleared._
_Note: By default it will clear the form from local storage when submitted with success._

```jsx
import React from 'react';
import { Controller, useController, useFormStorage } from '@resourge/react-form'

export function App() {
  const {
    isValid,
    field, 
    handleSubmit 
  } = useFormStorage(
	{
		list: Array.from({ length: 1000 }).map((_, index) => index + 1)
	},
	{
		uniqueId: 'unique form id' // Mandatory so you can save multiple forms
		// autoSyncWithLocalStorage (optional) When true, will automatically sync the form data with local storage one (default true)
		// shouldClearAfterSubmit (optional) When true, will clear local storage after submit (default true)
		// version (optional) Local storage version (to clear when changes are done to the form)
	}
  )

  const onSubmit = handleSubmit((form) => {
    ....
  })

  return (
    <form onSubmit={onSubmit}>
      <input { ...field('name') }/>
      <span>
      {
        isValid ? "Valid" : "Invalid" 
      } Form
      </span>
      <button type="submit">
        Save
      </button>
    </form>
  )
}
```
### Class vs JSON

When using `useFormStorage` all data will be converted to JSON (localStorage, indexDB, etc only work with pure JSON) that means Class's prototype will be removed. To prevent this from occurring some class decorators are provided.

#### PreserveArrayClass and PreserveClass

```Typescript
class Test {
	public doSomething() {

	}
}

class AppTest {
	public test = {
		subTest: 1
	};

	@PreserveClass(Test)
	public classTest1 = new Test();

	@PreserveArrayClass(Test)
	public classArrayTest = []

	@PreserveClass(Test)
	public classTest2?: Test;
}
```

## Controller

For more complex and deep forms, where render's can impact performance 
(like list's with multiple elements) `Controller` serves to minimize 
the impact a render can have on react, by only updating children if key `name`
is `touched`. 

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
# Known Bugs

## Input cursor jumping to end

Exists a bug in react inputs where using async onChange will cause the input cursor to jump to the end.
[https://github.com/facebook/react/issues/14904](https://github.com/facebook/react/issues/14904).

To prevent the bug from occurring, onChange params needs to be an Event.

Or create a component that controls the input value.
[See more](https://github.com/facebook/react/issues/14904#issuecomment-522194299) 

## License

MIT Licensed.
