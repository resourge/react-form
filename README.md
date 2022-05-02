# React-Form

`React-Form` is a simple and basic controlled form. Aiming to create forms with minimal effort.

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

To simplify the process of converting errors from validation packages (like joi, yup, zod, ajv, etc) to `useForm` lookalike errors, use `setDefaultOnError`.
You only need to setup this on the initialization of the application in this case App.tsx

`setDefaultOnError` will, by default (unless `onError` from [Form Options](#form-options) is set), customize the errors to fit `useForm` errors

```jsx
// In App.tsx
import { setDefaultOnError } from '@resourge/react-form'

setDefaultOnError((errors: any) => {
  // Customize errors to fit the model 
  // { [errors path]: [array of path error messages] }
  return {}
});
```

_Note: We plan to add more default validations in the future (like zod). If you have one and want to share, please do and contribute._

For yup validation, `setFormYupValidation`

```jsx
// In App.tsx
import { setFormYupValidation } from '@resourge/react-form'

setFormYupValidation();
```

## Usage

```Typescript
const [
  {
    form, // Form Data
    touches, isTouched, // Form touches
    errors, isValid, // Form validation
    context // Context
  },
  {
    triggerChange, reset, field,
    changeValue, getErrors, getFormErrors,
    getValue, handleSubmit, merge,
    onChange, resetTouch, setError,
    triggerManualTouch
  }
] = useForm(formData, formOptions)
```

`useForm` is the hook necessary to create forms. Using [formData](#form-data) and [formOptions](#form-options), the hook returns an array containing the [form state](#form-state-and-actions) and the [form actions](#form-state-and-actions).

## Quickstart

See more at [Errors](#errors)

```jsx
import React, { useState } from 'react';
import { useForm } from '@resourge/react-form';

export default function Form() {
  const [
    { 
      isValid 
	},
    { 
	  field, 
	  handleSubmit 
    }
  ] = useForm(
    { 
      name: 'Rimuru' 
    }
  )

  const onSubmit = handleSubmit((form) => {
    ....
  })

  return (
    <form onSubmit={onSubmit}>
      <input { ...field('name', { onChange: (e) => e.target.value }) }/>
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
const [
  ...
] = useForm(
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
const [
  ...
] = useForm(
  new User()
)
```

### Form Options

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| **validate** | `(form: T) => void \| Promise<void>` | false | Method to validate form. Usually with some kind of validator. (like yup, zod, joi, etc) |
| **isValid** | `({ form, isValid, errors }) => boolean` | false |  Method to define if form is valid |
| **onErrors** | `(errors: any \| any[]) => FormErrors` | false | Local method to treat errors. It's preferable to use [setDefaultOnError](#errors) |
| **onTouch** | `(key: FormKey<T>, value: unknown, previousValue: unknown) => void` | false | Method called every time a value is changed |

## Form State and Actions

`useForm` returns an array with `Form State` and `Form Actions` 

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
const [
  ...,
  {
    field
  }
] = useForm(
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
const [
  ...,
  {
    triggerChange
  }
] = useForm(
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

#### `setError`

Method to set custom errors

```Typescript
const [
  ...,
  {
    setError
  }
] = useForm(
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

#### `getErrors`

Returns error messages for the matched key

```Typescript
const [
  ...,
  {
    getErrors
  }
] = useForm(
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

#### `getFormErrors`

Returns `FormErrors` for the matched key

```Typescript
const [
  ...,
  {
    getFormErrors
  }
] = useForm(
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
getFormErrors('product.category') 
/// Can return (depends on the validation)
{
  'category': [<<Error Messages>>],
  'category.name': [<<Error Messages>>],
  'category.type': [<<Error Messages>>],
  'category.type.name': [<<Error Messages>>],
  'category.type.type': [<<Error Messages>>]
}
```

#### `reset`

Resets form state

```Typescript
const [
  ...,
  {
    reset
  }
] = useForm(
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
const [
  ...,
  {
    merge
  }
] = useForm(
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
const [
  ...,
  {
    onChange
  }
] = useForm(
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
const [
  ...,
  {
    changeValue
  }
] = useForm(
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
const [
  ...,
  {
    changeValue
  }
] = useForm(
  {
    name: 'Rimuru'
  }
)
...
getValue('name') /// Rimuru
```

#### `resetTouch`

Clears touch's

_Note: Will not render the component_

```Typescript
const [
  ...,
  {
    resetTouch
  }
] = useForm(
  ...
)
...
resetTouch()
```

#### `triggerManualTouch`

Triggers manual touch

_Note: Will not render the component_

```Typescript
const [
  ...,
  {
    resetTouch
  }
] = useForm(
  {
    name: 'Rimuru'
  }
)
...
triggerManualTouch('name')
```

## Form Provider

For more complex and deep forms.

```jsx
import React from 'react';
import { FormProvider, useForm } from '@resourge/react-form'

export function CustomElement() {
  // field is the same as doing field('name')
  const { field, formState } = useFormField('name')

  return (
    <>
      <span>
      {
        formState.isValid ? "Valid" : "Invalid" 
      } CustomElement
      </span>
      <input {...field} />
    </>
  )
}

export function App() {
  const [
    {
      context
    }
  ] = useForm( ... )

  return (
    <FormProvider context={context}>
      <CustomElement />
      ...
    </FormProvider>
  )
}
```

## Controller

For more complex and deep forms, where render's can impact performance 
(like list's with multiple elements) `Controller` serves to minimize 
the impact a render can have on react, by only updating children if key `name`
is `touched`. 

```jsx
import React from 'react';
import { Controller, useFormField, useForm } from '@resourge/react-form'

function CustomElement({ value }: { value: number }) {
  const { 
    field
  } = useController()

  return (
    <div>
      { value } <button
        onClick={() => {
          field.onChange && field.onChange(Math.random())
        }}
      >
        Update with random value
      </button>
    </div>
  )
}

export function App() {
  const [
    {
      context,
      form
    }
  ] = useForm({
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
## License

MIT Licensed.