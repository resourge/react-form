# @resourge/react-form

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

`@resourge/react-form` package provides a set of utilities for managing form state in react applications with built-in storage synchronization. It offers hooks and components designed to streamline form development, optimize rendering performance, and seamlessly synchronize form data with storage solutions.

## Features

- `Form State Management`: Easily manage form state and data using the `useForm` hook, providing a convenient interface for handling form inputs, validation, and submission.
- `Reactive Form State`: The form state is fully reactive, meaning any direct changes to the form trigger automatic updates across your components, ensuring your UI always reflects the current state.
- `Automatic Storage Synchronization`: Using `useFormStorage` automatically synchronize form data with storage solutions such as `localStorage` or `AsyncStorage` to persist user input's across sessions.
- `Performance Optimization`: Improve rendering performance for large forms with the `Controller` component, which updates only when relevant form fields change.
- `Context-based Architecture`: Leverage the power of react context to provide form state and data to nested components with the `FormProvider` component.
- `Customization and Flexibility`: Customize storage options, synchronization behavior, and form submission handling to suit your application's specific requirements.
- `Developer-friendly API`: Utilize intuitive hooks and components to simplify form development and reduce boilerplate code.

## Table of Contents

- [Installation](#installation)
- [useForm](#useForm)
- [useFormSplitter](#useFormSplitter)
- [useFormStorage](#useFormStorage)
- [FormProvider](#FormProvider)
- [Controller](#Controller)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

Install using [Yarn](https://yarnpkg.com):

```sh
yarn add @resourge/react-form
```

or NPM:

```sh
npm install @resourge/react-form --save
```

# useForm

`useForm` is a custom react hook for handling form state, validation, and submission in react applications. It simplifies form management by providing a set of methods and options to manage form state, handle form events, and perform form validation.

## Usage

```tsx
import { useForm } from "@resourge/react-form";

const MyFormComponent = () => {
  const { form, handleSubmit, field, getErrors, hasError } = useForm({
    username: "",
    password: "",
  });

  const changeUserNameToDefault = () => {
    // Direct changes to form are reactive, meaning it will trigger an update to the sate
    form.username = "Default User";
  };

  const onSubmit = handleSubmit(async () => {
    // handle form submission logic
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...field("username")} />
      <input {...field("password")} />
      <button onClick={changeUserNameToDefault}>
        Change Username to default
      </button>
      <button type="submit">Submit</button>
      {hasError("username") &&
        getErrors("username").map((error) => <span key={error}>{error}</span>)}
      {hasError("password") &&
        getErrors("username").map((error) => <span key={error}>{error}</span>)}
    </form>
  );
};

export default MyFormComponent;
```

## API

`useForm(defaultValue: T | (() => T) | { new(): T }, options?: FormOptions<T>): UseFormReturn<T>`

`useForm` is the main hook exported by this package. It takes two parameters:

### Parameters

- `initialState`: The initial value of the form. It can be an object, a function returning an object or a new instance of a class, or a constructor.
- `options` (optional): Additional options for customizing form behavior.

#### Options

`onChange`
Callback function triggered whenever the form state changes. It receives the current form state as an argument.

`onSubmit`
Upon successful form submission, this callback function is invoked, receiving the form data as its argument.

`validate`
Designed for custom validation of form fields, this function takes the form data and an array of changed keys as arguments. It returns and empty array for success, an array of error messages, or throws errors if validation fails.

`validationType`
Flag indicating when validation errors are displayed.

- `onSubmit`: Errors appear only after submission. Newly added fields will display errors only after submitting, while previously interacted fields will update errors when touched.
- `onTouch`: Errors are displayed as soon as a field is touched.
- `always`: Errors are shown immediately regardless of touch or submission.

### Returns

Contains the following properties and methods:

- `changeValue(key: string, value: any, produceOptions?: FieldOptions): void`: Facilitates altering the value of a designated form field. Parameters include the field's key, the new value, and optional field options.

```typescript
// Change the value of the 'name' field to 'John'
changeValue("name", "John");
```

- `context`: Provides a context object primarily employed for seamless integration with the FormProvider/Controller pattern.
- `errors`: Contains error messages associated with each form field.

```tsx
// Display error messages for the 'email' field
{
  errors["email"] && <span className="error">{errors["email"]}</span>;
}
```

- `field(key: string, options?: FieldOptions): FieldForm`: Establishes connections between form elements and specific fields, offering native attributes such as onChange, name, and value.

```tsx
// Connect an input field to the 'name' field
<input {...field("name")} />
```

- `form`: Reflects the current state of the form, encapsulating the values of all form fields.

```tsx
// Access the value of the 'email' field
const emailValue = form.email;
```

- `getErrors(key: string, options?: GetErrorsOptions): GetErrors`: Retrieves error messages pertinent to a particular form field, considering specified options.

```tsx
// Get error messages for the 'password' field
const passwordErrors = getErrors("password");
```

- `getValue(key: string): any`: Fetches the value of a designated form field.

```tsx
// Get the value of the 'username' field
const usernameValue = getValue("username");
```

- `handleSubmit(onValid: SubmitHandler, onInvalid?: ValidateSubmission): (event?: FormEvent<HTMLFormElement> | react.MouseEvent) => Promise<K | undefined>`: Manages form submission, executing a function upon valid submission and optionally controlling submission behavior when the form is invalid.

```tsx
// Handle form submission with custom validation logic
const submitHandler = handleSubmit(
  (form) => {
    // Submit form data to the server
  },
  (errors) => {
    // Handle form submission when there are validation errors
    return true; // Continue with submission even if there are errors
  }
);
```

- `hasError(key: string, options?: GetErrorsOptions): boolean`: Checks if a specified form field contains errors, considering specified options.

```tsx
// Check if the 'username' field has errors
const hasUsernameError = hasError("username");
```

- `hasTouch(key: string): boolean`: Checks if a specified form field was touched.

```tsx
// Check if the 'username' field was touched
const hasUsernameTouch = hasTouch("username");
```

- `isTouched`: Indicates whether any form field has been interacted with by the user.
- `isValid`: Indicates whether the form currently holds valid data, validating all form field values.
- `onChange(key: string, fieldOptions?: FieldOptions): (value: any) => void`: Generates a callback function to manage changes to a specific form field.

```tsx
// Generate a callback function to handle changes to the 'password' field
const handlePasswordChange = onChange("password");
```

- `reset(newForm?: Partial<Record<string, any>>, resetOptions?: ResetOptions): Promise<void>`: Resets the form state to its initial state or a specified new form state, with optional resetting of form options.

```tsx
// Reset the form state to its initial state
reset();
```

- `resetTouch(): void`: Clears touch states for all form fields.

```tsx
// Clear touch states for all form fields
resetTouch();
```

- `setError(errors: Array<{ errors: string[], path: string }>): void`: Sets custom errors for specific form fields.

```tsx
// Set custom errors for the 'email' field
setError([{ path: "email", errors: ["Invalid email address"] }]);
```

- `triggerChange(cb: OnFunctionChange, produceOptions?: ProduceNewStateOptions): void`: Enables simultaneous changes to the form state within a single render cycle, accepting a callback function to modify the state and optional options for customization.

```tsx
triggerChange((form) => {
  form.username = "john_doe";
  form.email = "john@example.com";
});
```

- `updateController(key: string): void`: Manually triggers an update of the Controller component associated with a specific form field.

```tsx
// Manually force the Controller component associated with the 'email' field to update
updateController("email");
```

- `watch(key: string | 'submit', method: WatchMethod): void`: Monitors specific form fields or form submission events, executing specified methods upon occurrence of these events.

```tsx
// Watch changes to the 'email' field and execute a method
watch("email", (form) => {
  // Handle changes to the 'email' field
});
```

# useFormSplitter

`useFormSplitter` hook is designed to split a larger form into smaller, more manageable sections. It creates a separate form for the specified form field key, allowing you to interact with only a portion of the overall form data.

## Usage

```jsx
import { useFormSplitter } from "@resourge/react-form";

const MyComponent = () => {
  const { form, handleSubmit, field } = useFormSplitter("personalDetails");

  const onSubmit = handleSubmit((form) => {
    // Handle form submission
    console.log(form);
  });

  return (
    <form onSubmit={onSubmit}>
      <label>
        First Name:
        <input {...field("firstName")} />
      </label>
      <label>
        Last Name:
        <input {...field("lastName")} />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
};
```

## API

### Parameters

- `formFieldKey` (optional): The key from the `form` state to create the splitter form. Note that if `useFormSplitter` is used inside a `Controller`, this parameter is not needed. Otherwise, it is mandatory.

### Return

`useFormSplitter` hook returns an object with properties and methods identical to those returned by the `useForm` hook. However, these properties and methods operate specifically within the context of the specified form field key (`formFieldKey`).

# useFormStorage

`useFormStorage` hook is designed to create a form where changes are automatically saved in a storage mechanism such as local storage or session storage. It extends the functionality of the useForm hook by integrating storage management capabilities.

#### Note

Class instances can seamlessly work with `useFormStorage` when accompanied by the `PreserveClass` or `registerClass` functions. These functions ensure that class prototypes are preserved, enabling class instances to function correctly with the form storage mechanism. This capability is especially beneficial when dealing with forms that involve complex data structures or encapsulation within classes.

## Usage

```tsx
import { useFormStorage } from '@resourge/react-form';

// Example usage with default value and options
const MyComponent = () => {
  const { form, handleSubmit, restoreFromStorage } = useFormStorage(initialFormValue, {
    storage: localStorage,
    uniqueId: 'myForm',
    autoSyncWithStorage: true,
    onLoading: (isLoading) => {
      // Handle loading state
    },
    onStorageError: (error) => {
      // Handle storage error
    },
    shouldClearAfterSubmit: true,
    version: '1.0.0',
  });

  // Use form, handleSubmit, and other methods as needed

  return (
    // Your JSX components
  );
};
```

## API

### Syntax

```typescript
function useFormStorage<T extends Record<string, any>>(
  defaultValue: T | (() => T) | { new (): T },
  options: FormStorageOptions<T>
): UseFormStorageReturn<T>;
```

### Parameters

- `defaultValue`: Represents the initial value or a function that returns the initial value of the form.
- `options`: An object containing various configuration options for form storage, extending the options available in the useForm hook

#### Options

- `storage`: The storage mechanism (e.g., localStorage) where form data will be saved.
- `uniqueId`: A unique identifier for the form data within the storage.
- `autoSyncWithStorage` (optional, default: `true`): Whether to automatically synchronize form data with storage.
- `onLoading` (optional): A callback function to handle loading state while reading from storage.
- `onStorageError` (optional): A callback function to handle errors that occur during storage operations.
- `shouldClearAfterSubmit` (optional, default: `true`): A boolean value indicating whether to clear the form data from storage after successful form submission. Default is true.
- `version` (optional, default: `'1.0.0'`): A version string used to track changes in form data and clear storage accordingly.

### Return Value

`useFormStorage` hook returns an object with properties and methods similar to those returned by the `useForm` hook. Additionally, it includes a `restoreFromStorage` method, which synchronizes the form data with the data stored in the storage mechanism.

## PreserveClass/registerClass Function

### PreserveClass

`PreserveClass` is a utility function provided alongside `useFormStorage` to register a class for serialization. It ensures that class instances are properly serialized and deserialized when stored in the storage mechanism. Here's how you can use it:

```typescript
import { PreserveClass } from "useFormStorage";

// Define form data structure
@PreserveClass
class UserData {
  name: string;
  email: string;

  constructor() {
    this.name = "";
    this.email = "";
  }
}
```

`@PreserveClass` decorator ensures that the `UserData` class is registered for serialization, allowing instances of this class to be stored and retrieved from storage seamlessly.

### registerClass

`registerClass` is another utility function to manually register a class for serialization. It can be used if you prefer not to use decorators. Here's how you can use it:

```typescript
import { registerClass } from "useFormStorage";

// Define form data structure
class UserData {
  name: string;
  email: string;

  constructor() {
    this.name = "";
    this.email = "";
  }
}

// Register class for serialization
registerClass(UserData);
```

`registerClass` function ensures that instances of the `UserData` class are properly serialized and deserialized when stored in the storage mechanism.

#### Example

```tsx
import { useFormStorage, PreserveClass } from '@resourge/react-form';

// Define form data structure
@PreserveClass
class UserData {
  name: string;
  email: string;

  constructor() {
    this.name = '';
    this.email = '';
  }
}

// Register class for serialization (alternative method)
registerClass(UserData);

// Use useFormStorage hook
const MyForm = () => {
  const { formData, handleSubmit, field } = useFormStorage<UserData>(
    UserData,
    {
      storage: localStorage,
      uniqueId: 'userFormData',
      autoSyncWithStorage: true,
      onLoading: (isLoading) => {
        // Handle loading state
      },
      onStorageError: (error) => {
        // Handle storage error
      },
      shouldClearAfterSubmit: true,
      version: '1.0.0',
    }
  );

  return (
    <form onSubmit={handleSubmit(() => {
		....
	})}>
      <input type="text" { ...field('name') }/>
      <input type="email" { ...field('email') }/>
      <button type="submit">Submit</button>
    </form>
  );
};

export default MyForm;
```

# FormProvider

`FormProvider` component is a provider for deep forms. It wraps your form components and provides the form context to its descendants. It is typically used in conjunction with the `useForm` | `useFormStorage` | `useFormSplitter` hook to manage form state.

## Usage

```tsx
import { FormProvider, useForm } from "@resourge/react-form";

const MyFormComponent = () => {
  const { context } = useForm<MyFormData>(); // Replace MyFormData with your form data type
  // Access form data, state, and methods from context

  return (
    <FormProvider context={context}>{/* Your form components */}</FormProvider>
  );
};
```

# Form

`Form` component is a wrapper for html form and FormProvider. It wraps your form components and provides the form context to its descendants. It is typically used in conjunction with the `useForm` | `useFormStorage` | `useFormSplitter` hook to manage form state.

## Usage

```tsx
import { FormProvider, useForm } from "@resourge/react-form";

const MyFormComponent = () => {
  const { context } = useForm<MyFormData>(); // Replace MyFormData with your form data type
  // Access form data, state, and methods from context

  return (
    <Form context={context} onSubmit={(form) => {
		...
	}}>{/* Your form components */}</Form>
  );
};
```

## useFormContext

`useFormContext` hook provides access to the form context created by the nearest `FormProvider` component. It returns the form context containing form data, state, and methods.

```typescript
import { useFormContext } from "@resourge/react-form";

const context = useFormContext<MyFormData>();
```

# Controller

`Controller` component is used to optimize rendering performance by only updating its children if the specified form field (`name`) changes. This is especially useful for large forms with many elements or components.

`Controller` optimizes rendering performance by preventing unnecessary updates to its children when form data changes, thus improving the performance of large forms.

## Usage

```tsx
import { Controller, useForm } from "@resourge/react-form";

const MyFormComponent = () => {
  const { context } = useForm<MyFormData>(); // Replace MyFormData with your form data type
  // Access form data, state, and methods from context

  return (
    <FormProvider context={context}>
      <Controller name="fieldName" context={context}>
        {/* Your form field components */}
      </Controller>
    </FormProvider>
  );
};
```

## useController

`useController` hook provides access to the context of the nearest `Controller` component. It returns the form context associated with the specified form field name.

```typescript
import { useController } from "@resourge/react-form";

const context = useController<MyFormData>("fieldName");
```

## Documentation

For comprehensive documentation and usage examples, visit the [react-form documentation](https://resourge.vercel.app/docs/react-form/intro).

## Contributing

Contributions to `@resourge/react-form` are welcome! To contribute, please follow the [contributing guidelines](CONTRIBUTING.md).

## License

`@resourge/react-form` is licensed under the [MIT License](LICENSE).

## Contact

For questions or support, please contact the maintainers:

- GitHub: [Resourge](https://github.com/resourge)
