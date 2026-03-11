# vue-form-submit

Simple Vue 3 composables for handling form submission.

Supports optional validation with any [Standard Schema](https://standardschema.dev/) compatible validation library, such as [Zod](https://zod.dev), [Valibot](https://valibot.dev/), [ArkType](https://arktype.io/), and others.

Unlike FormKit, VeeValidate, and similar libraries, this keeps things simple and doesn't interfere with either data storage or the UI workflow.

Full TypeScript support with type inference.

## Install

```sh
npm install vue-form-submit
```

## Use

```vue
<script setup lang="ts">
import * as v from "valibot"
import { useSubmit } from "vue-form-submit"

// Store input data however you prefer, e.g. with Vue reactive or ref.
const fields = reactive({
  name: "",
})

const { form, submit, submitting, errors } = useSubmit({
  input: fields,
  // Schema is optional but usually recommended.
  // Use any Standard Schema compatible library (Valibot in this example).
  schema: v.object({
    name: v.pipe(v.string(), v.trim(), v.minLength(1, "Please enter your name.")),
  }),
  async onSubmit(input) {
    // Input is validated against the schema and typed accordingly.
    await api.post(input)
  },
})
</script>

<template>
  <form ref="form" @submit.prevent="submit">
    <!-- No special syntax for input fields — just use what you prefer. -->
    Name: <input v-model="fields.name" />

    <button type="submit" :disabled="submitting">Submit</button>

    <!-- Raw validation errors. See below for how to flatten or structure them. -->
    <div v-for="error in errors">{{ error }}</div>
  </form>
</template>
```

## useSubmit composable

```ts
const {
  // All return values are optional to use.
  form,
  submit,
  submitting,
  submitted,
  errors,
} = useSubmit({
  // All options are optional.
  input,
  schema,
  onSubmit,
  onErrors,
  // Optional overrides for the return value refs.
  form,
  submitting,
  submitted,
  errors,
})
```

## useSubmit options

### `input`

(Optional) The data to be validated and/or passed to `submit`. Can be a plain value, a ref, or a getter.

### `schema`

(Optional) A Standard Schema compatible schema (or a function returning a schema, useful when the schema depends on context). Works with Zod, Valibot, ArkType, and other Standard Schema compatible libraries.

### `onSubmit`

(Optional) `onSubmit` callback.

Only called if:

- The form is not already being submitted (`submitting.value` is falsy).
- HTML5 validation passes (if enabled).
- Schema validation passes (if used).

If `input` and/or `schema` are provided, the first argument passed to the `onSubmit` callback is the (possibly validated) form input. Any remaining arguments are the submit function arguments.

While submission is in progress, `submitting` is true.
After successful execution, `submitted` is true.

### `formatErrors`

(Optional) Error formatter function that transforms raw Standard Schema issues into the desired format.

See _"Formatting errors"_ below.

### `onErrors`

(Optional) Error callback.

Called (and awaited) when validation fails or when `errors.value` is set by the `onSubmit` handler.

### `form`, `submitting`, `submitted`, `errors`

Normally, `useSubmit` creates and returns these refs (see below), but you can optionally provide your own.

For example, you can share a single `submitting` flag between multiple forms:

```ts
const submitting = ref(false)

const { submit: submit1 } = useSubmit({
  submitting,
  async onSubmit() { /* ... */ }
})

const { submit: submit2 } = useSubmit({
  submitting,
  async onSubmit() { /* ... */ }
})

// `submitting` will be true during submission of either form.
```

## useSubmit with a separate onSubmit handler

The `onSubmit` handler can be passed as a separate argument — either alone or together with an options object:

```ts
// onSubmit handler only (shortcut):
const { submit, submitting } = useSubmit(async () => {
  await api.post()
})

// onSubmit handler with options:
const { submit, submitting } = useSubmit({ input, schema }, async (input) => {
  await api.post(input)
},)
```

## useSubmit return

### `form`

The form element ref.

Binding it with `<form ref="form">` enables HTML5 validation on submit.

### `submit`

The form submit function. Use it like:

- `<form @submit.prevent="submit">`
- `<button @click="submit">`

It will:

- Run HTML5 validation (if the form ref is set).
- Validate against the schema (if provided).
- Call the `onSubmit` callback (if provided).

Arguments passed to this function are forwarded to the `onSubmit` callback, prepended with the form input (if `input` and/or `schema` are provided).

While submission is in progress, `submitting` is true. After successful execution, `submitted` is true.

### `submitting`

Whether a submission is currently in progress.

Use this to disable the submit button.

`useSubmit` will also skip submission if this is already `true`.

Type: `Ref<boolean>`.

### `submitted`

Whether the form has been successfully submitted.

Feel free to reset this manually. `useSubmit` doesn't depend on this value.

Type: `Ref<boolean>`.

### `errors`

Validation errors, either from schema validation or set manually in the `onSubmit` callback.

## Formatting errors

By default, errors are returned as raw Standard Schema issues.

Use the `formatErrors` option to format or structure them differently. For example, use the built-in `flatten` to convert them to `FlatErrors` (compatible with Valibot's `flatten()`):

```vue
<script setup lang="ts">
import * as v from "valibot"
import { flatten, useSubmit } from "vue-form-submit"

const fields = reactive({
  name: "",
})

const { form, submit, submitting, errors } = useSubmit({
  input: fields,
  schema: v.object({
    name: v.pipe(v.string(), v.trim(), v.minLength(1, "Please enter your name.")),
  }),
  formatErrors: flatten, // <--- Custom error formatter.
  async onSubmit(input) {
    await api.post(input)
  },
})
</script>

<template>
  <form ref="form" @submit.prevent="submit">
    Name: <input v-model="fields.name" />

    <!-- Field errors. -->
    <div v-for="error in errors?.nested?.name">{{ error }}</div>

    <button type="submit" :disabled="submitting">Submit</button>

    <!-- Form-level errors. -->
    <div v-for="error in errors?.root">{{ error }}</div>
  </form>
</template>
```

## Submit with arguments

Additional arguments passed to `submit` are forwarded to the `onSubmit` callback after `input`:

```ts
const { submit } = useSubmit({
  input,
  schema,
  async onSubmit(input, chargeImmediately = false) {
    await api.post({ ...input, chargeImmediately })
  },
})
```

Then in the template:

```html
<form ref="form" @submit.prevent="submit">
  <!-- Input fields omitted for brevity. -->
  <button type="submit">Submit</button>
  <button type="button" @click="submit(true)">
    Submit and Charge Immediately
  </button>
</form>
```

If no `input` option was provided, all arguments are passed through directly:

```ts
const { submit, submitting } = useSubmit(
  async (arg1: number, arg2: string, arg3 = false) => {
    // Note: no `input` argument.
    await api.post({ arg1, arg2, arg3 })
  },
)

// Arguments are type-checked:
submit(10, "foo")
submit(20, "bar", true)
```

## Custom submit errors

You can set `errors` inside the `onSubmit` handler. These are treated the same way as schema validation errors.

This is particularly useful together with `onErrors`:

```ts
const { submit, errors } = useSubmit({
  input,
  schema,
  onSubmit(input) {
    if (!validateInput(input)) {
      errors.value = [{ message: "Input is invalid." }]
    }
  },
  onErrors(errors) {
    // Errors here come from either schema validation or the onSubmit handler.
    console.error(errors)
  },
})
```

## useParse

`useParse` reactively runs Standard Schema validation on every input change.

It can be used together with `useSubmit` or independently.

Example with Valibot:

```vue
<script setup lang="ts">
import * as v from "valibot"
import { flatten, useParse } from "vue-form-submit"

const input = reactive({
  age: "" as string | number,
})

// By default, returns raw Standard Schema issues.
const { errors: presubmitErrors } = useParse({
  input,
  schema: v.object({
    age: v.number(),
  })
})

// Or use flatten for Valibot-style errors.
const { errors: presubmitErrors } = useParse({
  input,
  schema: v.object({
    age: v.number(),
  }),
  formatErrors: flatten
})
</script>

<template>
  <form @submit="...">
    Age: <input v-model.number="age" type="number">
    <button type="submit" :disabled="!presubmitErrors">Submit</button>
  </form>
</template>
```
