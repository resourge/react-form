# @resourge/react-form

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

`@resourge/react-form` package provides a set of utilities for managing form state in React applications with built-in storage synchronization. It offers hooks and components designed to streamline form development, optimize rendering performance and seamlessly synchronize form data with storage solutions.

## Features

- `Form State Management`: Handle form inputs, validation, and submission with `useForm`.
- `Reactive Form State`: The form state is fully reactive, meaning any direct changes to the form trigger automatic updates across your components, ensuring your UI always reflects the current state.
- `Automatic Storage Synchronization`: Sync form data with `localStorage` or `AsyncStorage` using `useFormStorage`.
- `Performance Optimization`: Efficient rendering with the Controller component.
- `Context-based Architecture`: Use `FormProvider` or `Form` to pass form state to nested components.
- `Customization and Flexibility`: Customize storage options, synchronization behavior, and form submission handling to suit your application's specific requirements.
- `Developer-friendly API`: Simplified API to reduce boilerplate code

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

or pnpm:

```sh
pnpm add @resourge/react-form
```

## Quick Start

### Basic Usage (useForm)

```tsx
import { useForm } from "@resourge/react-form";

const MyForm = () => {
  const { form, handleSubmit, field, hasError, getErrors } = useForm({
    username: "",
    password: "",
  });

  const onSubmit = handleSubmit((data) => console.log("Form Submitted:", data));

  return (
    <form onSubmit={onSubmit}>
      <input {...field("username")} placeholder="Username" />
      {hasError("username") && <span>{getErrors("username")[0]}</span>}

      <input {...field("password")} placeholder="Password" type="password" />
      {hasError("password") && <span>{getErrors("password")[0]}</span>}

      <button type="submit">Submit</button>
    </form>
  );
};
```

### Split Large Forms (useFormSplitter)

```tsx
import { useFormSplitter, useForm } from "@resourge/react-form";

const PersonalDetails = () => {
  const { form, field } = useFormSplitter("personalDetails");

  return (
    <>
      <input {...field("firstName")} placeholder="First Name" />
      <input {...field("lastName")} placeholder="Last Name" />
    </>
  );
};

const MyForm = () => {
  const { form, handleSubmit, field, hasError, getErrors, context } = useForm({
    personalDetails: {
      username: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit((data) => console.log("Form Submitted:", data));

  return (
    <Form context={context} onSubmit={onSubmit}>
      <PersonalDetails />

      <button type="submit">Submit</button>
    </Form>
  );
  /*
  or 
  return (
    <FormProvider context={context}> 
      <PersonalDetails />

      <button type="submit">Submit</button>
    </FormProvider>
  );
  */
};
```

### Persist Form Data (useFormStorage)

```tsx
import { useFormStorage } from "@resourge/react-form";

const MyPersistentForm = () => {
  const { form, handleSubmit, restoreFromStorage } = useFormStorage(
    { username: "", password: "" },
    {
      storage: localStorage,
      uniqueId: "myForm",
      autoSyncWithStorage: true,
      onLoading: (isLoading) => {
        // Handle loading state
      },
      onStorageError: (error) => {
        // Handle storage error
      },
      shouldClearAfterSubmit: true,
      version: "1.0.0",
    }
  );

  const onSubmit = handleSubmit((data) => console.log("Form Submitted:", data));

  return (
    <Form onSubmit={onSubmit}>
      <input {...field("username")} placeholder="Username" />
      {hasError("username") && <span>{getErrors("username")[0]}</span>}

      <input {...field("password")} placeholder="Password" type="password" />
      {hasError("password") && <span>{getErrors("password")[0]}</span>}

      <button type="submit">Submit</button>
    </Form>
  );
};
```

## useForm

Manages form state and validation.

### Parameters:

- `initialState`: Initial form value (object, function returning an object, or class instance).
- `options` (optional):
  - `onChange`: Triggered on form state change, receiving the current state
  - `onSubmit`: Triggered on successful form submission, receiving form data.
  - `validate`: Custom validation function, takes form data and changed keys, returns error messages or throws errors.
  - `watch`: Triggered when a specified key changes. Useful for updating dependent data, especially in asynchronous scenarios (e.g., fetching async data).
  - `validationType`: Controls when validation errors are shown:
    - `onSubmit`: Appear only after submission. Newly added fields only display errors after submitting.
    - `onTouch`: Errors show after field touch.
    - `always`: Show immediately

### Returns:

- `changeValue(key: string, value: any): void`: Changes the value of a specific form field.
  ```typescript
  changeValue("name", "John");
  ```
- `context`: Provides a context object for integration with `FormProvider`/`Controller`/`Form`.
- `errors`: Contains error messages for each form field.
  ```tsx
  errors["email"]?.errors && (
    <span className="error">{errors["email"]?.errors}</span>
  );
  ```
- `field(key: string, options?: FieldOptions): FieldForm`: Connects form elements to specific fields.
  - options:
    - `blur`: For changes only in blur
    - `onChange`: Custom changes on value change.
    - `readOnly`: Readonly only
  ```tsx
  <input {...field("name")} />
  ```
- `form`: Reactive form state.
  ```tsx
  const emailValue = form.email;
  form.email = "newEmail@email.email";
  ```
- `getErrors(key: string, options?: GetErrorsOptions): GetErrors`: Retrieves error messages for a form field.
  - options:
    - `includeChildsIntoArray`: Include all errors from child's.
    - `unique`: By default it will only return unique errors, filtering repeating.
  ```tsx
  const passwordErrors = getErrors("password");
  ```
- `getValue(key: string): any`: Fetches the value of a form field.
  ```tsx
  const usernameValue = getValue("username");
  ```
- `handleSubmit(onValid: SubmitHandler, validateErrors?: ValidateSubmissionErrors): (event?: FormEvent<HTMLFormElement> | react.MouseEvent) => Promise<K | undefined>`: Handles form submission, processing valid form data and managing invalid data based on custom logic.
  ```tsx
  const submitHandler = handleSubmit(
    (form) => {
      // Submit form data to the server
    },
    (errors) => {
      // Control which validation errors are acceptable for submission.
      // Allows dynamic error handling based on submission context.
      return errors;
    }
  );
  ```
- `hasError(key: string, options?: ErrorsOptions): boolean`: Checks if a form field has errors.
  - options:
    - `includeChildsIntoArray`: Include all errors from child's.
  ```tsx
  const hasUsernameError = hasError("username");
  ```
- `hasTouch(key: string): boolean`: Checks if a form field was touched.
  ```tsx
  const hasUsernameTouch = hasTouch("username");
  ```
- `isTouched`: Indicates if any field has been touched.
- `isValid`: Indicates if the form is valid.
- `reset(newForm?: Partial<Record<string, any>>, resetOptions?: ResetOptions): Promise<void>`: Resets the form state.
  - options:
    - `clearTouched`: Clear's touches on reset (default).
  ```tsx
  reset({});
  ```
- `resetTouch(): void`: Clears touch states for all form fields.
  ```tsx
  resetTouch();
  ```
- `setError(errors: Array<{ errors: string[], path: string }>): void`: Sets custom errors for specific form fields.
  ```tsx
  setError([{ path: "email", errors: ["Invalid email address"] }]);
  ```
- `updateController(key: string): void`: Forces an update of the `Controller` for a form field.
  ```tsx
  updateController("email");
  ```
- `watch<V>(key: string, method: WatchMethod): V`: (REMOVED) Changed to `useForm` options.

## useFormSplitter

Breaks up large forms into smaller parts.

### Parameters:

- `formFieldKey` (optional): Key from the `form` state for the splitter form. It's required unless `useFormSplitter` is used inside a `Controller`.

### Return:

- Same as useForm, but scoped to the `formFieldKey`

## useFormStorage

A specialized version of useForm that persists form state to local storage or session storage.

### Parameters:

- `defaultValue`: Initial value or a function returning the initial value of the form.
- `options`: Configuration options for form storage, extending those from `useForm` hook.
  - `storage`: Storage mechanism (e.g., `localStorage`) for saving form data.
  - `uniqueId`: A unique identifier for the form data in storage.
  - `autoSyncWithStorage` (optional, default: `true`): Whether to sync form data with storage automatically.
  - `onLoading` (optional): Callback for handling loading state when reading from storage.
  - `onStorageError` (optional): Callback for handling errors during storage operations.
  - `shouldClearAfterSubmit` (optional, default: `true`): Whether to clear form data from storage after submission.
  - `version` (optional, default: `'1.0.0'`): Version string to track changes in form data and clear storage when needed.

### Returns:

- Same as useForm, but persists data in storage.
- `restoreFromStorage`: Synchronizes the form data with the data stored in the storage mechanism.

### Note

Class instances work with `useFormStorage` when using the `PreserveClass` or `registerClass` functions. These functions preserve the class prototypes, ensuring that class instances interact correctly with the form storage mechanism. This is useful for forms with complex data structures or when data is encapsulated within classes.

#### PreserveClass

`PreserveClass` is a utility function for registering a class with `useFormStorage` to handle serialization. It ensures that instances of the class are correctly serialized and deserialized when interacting with the storage mechanism.

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

#### registerClass

`registerClass` is a utility function that allows you to manually register a class for serialization, providing an alternative to using decorators.

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

## FormProvider

Provides form context to nested components.

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

## Form

Wraps a form and provides context to nested components.

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

Hook to access the state of a `FormProvider` or `Form`.

```typescript
import { useFormContext } from "@resourge/react-form";

const context = useFormContext<MyFormData>();
```

## Controller

Optimizes form field rendering for large forms.

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

Hook to access the state of a `Controller`.

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
