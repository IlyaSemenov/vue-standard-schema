import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { MaybeRefOrGetter, Ref } from "@vue/reactivity"
import { ref, toValue } from "@vue/reactivity"

import type { ErrorsFormatter, StandardErrors } from "./errors"

export interface UseFormReturn<TArgs extends any[], TResult, TErrors> {
  /**
   * The form element ref.
   *
   * Using it with `<form ref="form">` will enable HTML5 validation on submit.
   */
  form: Ref<HTMLFormElement | undefined>
  /**
   * The actual form submit function that you should call with something like:
   *
   * - `<form @submit.prevent="submit">`
   * - `<button @click="submit">`
   *
   * It will:
   *
   * - Run HTML5 validation (if the form ref is set).
   * - Run Standard Schema validation (if the schema is provided).
   * - Call submit callback (if provided).
   *
   * Arguments passed to this submit function will be passed to the submit callback,
   * prepended with (possibly validated) form input (unless using the shortcut variant of useForm).
   *
   * During execution, `submitting` is true.
   * After successfull execution, `submitted` is true.
   */
  submit: (...args: TArgs) => Promise<TResult | undefined>
  /**
   * Is the form submit callback executing at the moment?
   *
   * Use this to disable submit button.
   *
   * Also, `useForm` will not perform submit if it sees this is `true`.
   */
  submitting: Ref<boolean>
  /**
   * Has the form been successfully submitted?
   *
   * Feel free to reset. `useForm` doesn't depend on this value.
   */
  submitted: Ref<boolean>
  /**
   * Validation errors.
   */
  errors: Ref<TErrors | undefined>
}

interface BaseOptions<TErrors> {
  /**
   * Error formatter function that transforms raw Standard Schema issues into the desired format.
   */
  formatErrors?: ErrorsFormatter<TErrors>
  /**
   * Error callback.
   *
   * Called (and awaited) if the validation fails, or if `errors.value` was set by the submit handler.
   */
  onErrors?: (errors: TErrors) => any
  /**
   * User-provided ref for `form` return value.
   */
  form?: Ref<HTMLFormElement | undefined>
  /**
   * User-provided ref for `submitting` return value.
   */
  submitting?: Ref<boolean>
  /**
   * User-provided ref for `submitted` return value.
   */
  submitted?: Ref<boolean>
  /**
   * User-provided ref for `errors` return value.
   */
  errors?: Ref<TErrors | undefined>
}

type SubmitCallback<Args extends any[], Result> = (
  ...args: Args
) => Result | PromiseLike<Result>

//
// No input.
//

/**
 * Vue3 composable for handling form submit.
 */
export function useForm<Args extends unknown[], Result, TErrors = StandardErrors>(
  options: BaseOptions<TErrors> & {
    input?: never
    schema?: never
    /**
     * Form submit callback.
     *
     * Only called if:
     * - Form is not being submitted at the moment (submitting.value is falsy).
     * - HTML5 validation passes (if enabled).
     *
     * The arguments are the submit function arguments.
     *
     * During execution, `submitting` is true.
     * After successfull execution, `submitted` is true.
     */
    submit?: SubmitCallback<Args, Result>
  },
): UseFormReturn<Args, Result, TErrors>

//
// Input only (no schema).
//

/**
 * Vue3 composable for handling form submit.
 *
 * Validates the input using Standard Schema.
 */
export function useForm<TInput, TArgs extends any[], TResult, TErrors = StandardErrors>(
  options: BaseOptions<TErrors> & {
    /**
     * Input value, or ref, or a getter for the submit input data.
     */
    input: MaybeRefOrGetter<TInput>
    schema?: never
    /**
     * Form submit callback.
     *
     * Only called if:
     * - Form is not being submitted at the moment (submitting.value is falsy).
     * - HTML5 validation passes (if enabled).
     *
     * The first argument is the form input, the rest arguments are the submit function arguments.
     *
     * During execution, `submitting` is true.
     * After successfull execution, `submitted` is true.
     */
    submit?: SubmitCallback<[TInput, ...TArgs], TResult>
  },
): UseFormReturn<TArgs, TResult, TErrors>

//
// Schema.
//

/**
 * Vue3 composable for handling form submit.
 *
 * Validates the input using Standard Schema.
 */
export function useForm<TSchema extends StandardSchemaV1, TArgs extends any[], TResult, TErrors = StandardErrors>(
  options: BaseOptions<TErrors> & {
    /**
     * Input data to be validated (plain value, ref or getter).
     */
    input?: unknown
    /**
     * Standard Schema compatible schema (plain value, ref or getter).
     */
    schema: MaybeRefOrGetter<TSchema>
    /**
     * Form submit callback.
     *
     * Only called if:
     * - Form is not being submitted at the moment (submitting.value is falsy).
     * - HTML5 validation passes (if enabled).
     * - Standard Schema validation passes.
     *
     * The first argument is the validated input, the rest arguments are the submit function arguments.
     *
     * During execution, `submitting` is true.
     * After successfull execution, `submitted` is true.
     */
    submit?: SubmitCallback<[StandardSchemaV1.InferOutput<TSchema>, ...TArgs], TResult>
  },
): UseFormReturn<TArgs, TResult, TErrors>

//
// No input, callback only.
//

/**
 * Vue3 composable for handling form submit.
 */
export function useForm<TArgs extends any[], TResult>(
/**
 * Form submit callback.
 *
 * Only called if:
 * - Form is not being submitted at the moment (submitting.value is falsy).
 * - HTML5 validation passes (if enabled).
 *
 * The arguments are the submit function arguments.
 *
 * During execution, `submitting` is true.
 * After successfull execution, `submitted` is true.
 */
  submit?: SubmitCallback<TArgs, TResult>,
): UseFormReturn<TArgs, TResult, StandardErrors>

//
// Implementation.
//

export function useForm(
  optionsOrSubmit?:
    | (BaseOptions<unknown> & {
      input?: unknown
      schema?: MaybeRefOrGetter<StandardSchemaV1>
      submit?: SubmitCallback<unknown[], unknown>
    })
    | SubmitCallback<unknown[], unknown>,
): UseFormReturn<unknown[], unknown, unknown> {
  const options
    = (typeof optionsOrSubmit === "function" ? undefined : optionsOrSubmit) ?? {}
  const submitCallback
    = typeof optionsOrSubmit === "function" ? optionsOrSubmit : options?.submit
  const hasInput = options.input !== undefined

  const form = options.form ?? ref<HTMLFormElement>()
  const errors = options.errors ?? ref()
  const submitting = options.submitting ?? ref(false)
  const submitted = options.submitted ?? ref(false)

  const formatErrors = options.formatErrors ?? ((issues: StandardErrors) => issues)

  async function submit(...args: unknown[]) {
    if (submitting.value) {
      return
    }
    submitted.value = false
    errors.value = undefined
    if (form.value && !form.value.checkValidity()) {
      form.value.reportValidity()
      return
    }
    submitting.value = true
    try {
      const input = toValue(options.input)
      const schema = toValue(options.schema)
      const parseResult = schema ? await schema["~standard"].validate(input) : undefined
      if (parseResult && parseResult.issues) {
        errors.value = formatErrors(parseResult.issues)
        await options.onErrors?.(errors.value)
      } else {
        const returnValue = await Promise.resolve()
          .then(() =>
            hasInput || parseResult
              ? submitCallback?.(parseResult ? parseResult.value : input, ...args)
              : submitCallback?.(...args),
          )
        if (errors.value) {
          await options.onErrors?.(errors.value)
        } else {
          submitted.value = true
        }
        return returnValue
      }
    } finally {
      submitting.value = false
    }
  }

  return { form, submit, submitting, submitted, errors }
}
