# Form Handling Guide with Yup and React Hook Form

This guide explains how to handle forms in our React application using Yup for validation and React Hook Form for form management, based on our project implementation patterns.

## Table of Contents

- [Introduction](#introduction)
- [Setup and Dependencies](#setup-and-dependencies)
- [Basic Implementation Pattern](#basic-implementation-pattern)
- [Step-by-Step Guide](#step-by-step-guide)
- [Form Validation with Yup](#form-validation-with-yup)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)

## Introduction

In our project, we use a combination of [React Hook Form](https://react-hook-form.com/) and [Yup](https://github.com/jquense/yup) to create form handling hooks that are:

- Type-safe
- Easily reusable
- Well-validated
- Performance optimized

This approach centralizes form handling logic in custom hooks like `useLoginAdmin`, keeping our components clean and focused on presentation.

## Setup and Dependencies

To implement this pattern, you'll need the following dependencies:

```bash
# Already included in our project
npm install react-hook-form @hookform/resolvers/yup yup
```

## Basic Implementation Pattern

Our form handling pattern follows this structure:

1. Define a type for form values
2. Create a Yup validation schema
3. Create a custom hook that:
   - Sets up the form with React Hook Form
   - Handles form submission
   - Manages loading state
   - Handles errors
   - Returns necessary values and handlers to the component

## Step-by-Step Guide

Let's walk through how to implement a form using our pattern, based on the `useLoginAdmin` hook:

### 1. Define form value types

First, define TypeScript types for your form values:

```typescript
export type LoginValues = {
  username: string
  password: string
}
```

### 2. Create validation schema with Yup

Define validation rules for each field using Yup:

```typescript
import { object, string } from 'yup'

const schema = object().shape({
  username: string().required('Username is required'),
  password: string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
})
```

### 3. Create a custom form hook

Create a custom hook that handles the form logic:

```typescript
export const useLoginAdmin = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Get form methods from React Hook Form with Yup resolver
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<LoginValues>({
    mode: 'onChange',
    resolver: yupResolver(schema),
  })

  // Helper computed value for button state
  const shouldDisableButton = useMemo(
    () => !isDirty || !isValid || isLoading,
    [isDirty, isValid, isLoading],
  )

  // Form submission handler
  const handleLogin = async (data: LoginValues) => {
    try {
      setIsLoading(true)
      // API call and state updates
      // ...
      onSuccess?.()
    } catch (error) {
      // Error handling
    } finally {
      setIsLoading(false)
    }
  }

  // Return values and handlers to the component
  return {
    control,
    errors,
    isDirty,
    isValid,
    isLoading,
    shouldDisableButton,
    handleSubmit,
    handleLogin,
  }
}
```

### 4. Use the hook in a component

In your component, use the hook:

```tsx
const LoginForm = () => {
  const {
    control,
    handleSubmit,
    handleLogin,
    errors,
    shouldDisableButton,
    isLoading,
  } = useLoginAdmin(() => {
    // Navigate or perform actions after successful login
    router.push('/admin/dashboard')
  })

  return (
    <form onSubmit={handleSubmit(handleLogin)}>
      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <Input {...field} label="Username" error={errors.username?.message} />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type="password"
            label="Password"
            error={errors.password?.message}
          />
        )}
      />

      <Button type="submit" disabled={shouldDisableButton} loading={isLoading}>
        Login
      </Button>
    </form>
  )
}
```

## Form Validation with Yup

### Common Validation Rules

Here are some common Yup validation rules you can use:

```typescript
// String validations
string()
  .required('This field is required')
  .min(3, 'Must be at least 3 characters')
  .max(50, 'Must be less than 50 characters')
  .email('Must be a valid email')
  .matches(/regex/, 'Must match pattern')

// Number validations
number()
  .required('This field is required')
  .min(0, 'Must be at least 0')
  .max(100, 'Must be at most 100')
  .positive('Must be a positive number')

// Boolean validation
boolean().required('This field is required').oneOf([true], 'Must be accepted')

// Array validation
array()
  .of(string())
  .min(1, 'Select at least one option')
  .required('This field is required')

// Object validation
object().shape({
  name: string().required('Name is required'),
  age: number().positive().integer().required('Age is required'),
})
```

### Conditional Validation

You can also add conditional validation:

```typescript
object().shape({
  isEmployed: boolean(),
  employer: string().when('isEmployed', {
    is: true,
    then: schema => schema.required('Employer is required when employed'),
    otherwise: schema => schema,
  }),
})
```

## Advanced Usage

### Form Arrays

For handling dynamic form arrays, combine React Hook Form's `useFieldArray` with Yup:

```typescript
// In your hook
const { fields, append, remove } = useFieldArray({
  control,
  name: 'items',
})

// Yup schema
const schema = object().shape({
  items: array()
    .of(
      object().shape({
        name: string().required('Name is required'),
        quantity: number().required('Quantity is required').min(1),
      }),
    )
    .min(1, 'Add at least one item'),
})
```

### Form Submission with API Integration

Here's a pattern for form submission with API integration:

```typescript
const handleSubmit = async (data: FormValues) => {
  try {
    setIsLoading(true)

    // API call
    const response = await apiFunction(data)

    // Success handling
    toast('Operation successful', { type: 'success' })

    // Optional callback
    onSuccess?.(response)
  } catch (error) {
    // Error handling with our utility
    toast(getAPIErrorMessage(error))
  } finally {
    setIsLoading(false)
  }
}
```

## Best Practices

1. **Separate form logic from UI components** - Use custom hooks for form logic
2. **Type everything** - Always define TypeScript types for form values
3. **Consistent error handling** - Use utilities like `getAPIErrorMessage` for consistency
4. **Loading states** - Always manage and expose loading states for better UX
5. **Form state indicators** - Expose `isDirty` and `isValid` to show proper UI feedback
6. **Default values** - Set default values when needed in the `useForm` hook
7. **Form reset** - Implement reset functionality when forms need to be cleared

---

This guide covers the basic patterns for handling forms in our application. For more advanced usage, refer to the official documentation for [React Hook Form](https://react-hook-form.com/get-started) and [Yup](https://github.com/jquense/yup).
