import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { MaybeRefOrGetter, Ref } from "@vue/reactivity"
import { ref, toValue } from "@vue/reactivity"

import type { ErrorsFormatter, StandardErrors } from "./errors"

export interface UseSubmitReturn<TArgs extends any[], TResult, TErrors> {
  /**
   * The form element ref.
   *
   * Using it with `<form ref="form">` will enable HTML5 validation on submit.
   */
  form: Ref<HTMLFormElement | undefined>
  /**
   * The form submit function. Use it like:
   *
   * - `<form @submit.prevent="submit">`
   * - `<button @click="submit">`
   *
   * It will:
   *
   * - Run HTML5 validation (if the form ref is set).
   * - Run Standard Schema validation (if the schema is provided).
   * - Call the `onSubmit` callback (if provided).
   *
   * Arguments passed to this function are forwarded to the `onSubmit` callback,
   * prepended with the (possibly validated) form input (unless using the shortcut variant of `useSubmit`).
   *
   * While submission is in progress, `submitting` is true.
   * After successful execution, `submitted` is true.
   */
  submit: (...args: TArgs) => Promise<TResult | undefined>
  /**
   * Whether a submission is currently in progress.
   *
   * Use this to disable the submit button.
   *
   * `useSubmit` will also skip submission if this is already `true`.
   */
  submitting: Ref<boolean>
  /**
   * Has the form been successfully submitted?
   *
   * Feel free to reset. `useSubmit` doesn't depend on this value.
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
   * Called (and awaited) when validation fails or when `errors.value` is set by the `onSubmit` handler.
   */
  onErrors?: (errors: TErrors) => any
  /**
   * User-provided ref for the `form` return value.
   */
  form?: Ref<HTMLFormElement | undefined>
  /**
   * User-provided ref for the `submitting` return value.
   */
  submitting?: Ref<boolean>
  /**
   * User-provided ref for the `submitted` return value.
   */
  submitted?: Ref<boolean>
  /**
   * User-provided ref for the `errors` return value.
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
 * Vue 3 composable for handling form submission.
 */
export function useSubmit<Args extends unknown[], Result, TErrors = StandardErrors>(
  options: BaseOptions<TErrors> & {
    input?: never
    schema?: never
    /**
     * onSubmit callback.
     *
     * Only called if:
     * - The form is not already being submitted (`submitting.value` is falsy).
     * - HTML5 validation passes (if enabled).
     *
     * Arguments are passed through from the submit function.
     *
     * While submission is in progress, `submitting` is true.
     * After successful execution, `submitted` is true.
     */
    onSubmit?: SubmitCallback<Args, Result>
  },
): UseSubmitReturn<Args, Result, TErrors>

//
// Input only (no schema).
//

/**
 * Vue 3 composable for handling form submission.
 *
 * Validates the input using Standard Schema.
 */
export function useSubmit<TInput, TArgs extends any[], TResult, TErrors = StandardErrors>(
  options: BaseOptions<TErrors> & {
    /**
     * The input data: a plain value, ref, or getter.
     */
    input: MaybeRefOrGetter<TInput>
    schema?: never
    /**
     * onSubmit callback.
     *
     * Only called if:
     * - The form is not already being submitted (`submitting.value` is falsy).
     * - HTML5 validation passes (if enabled).
     *
     * The first argument is the form input; the remaining arguments are passed through from the submit function.
     *
     * While submission is in progress, `submitting` is true.
     * After successful execution, `submitted` is true.
     */
    onSubmit?: SubmitCallback<[TInput, ...TArgs], TResult>
  },
): UseSubmitReturn<TArgs, TResult, TErrors>

//
// Schema.
//

/**
 * Vue 3 composable for handling form submission.
 *
 * Validates the input using Standard Schema.
 */
export function useSubmit<TSchema extends StandardSchemaV1, TArgs extends any[], TResult, TErrors = StandardErrors>(
  options: BaseOptions<TErrors> & {
    /**
     * The input data to validate (plain value, ref, or getter).
     */
    input?: unknown
    /**
     * A Standard Schema compatible schema (plain value, ref, or getter).
     */
    schema: MaybeRefOrGetter<TSchema>
    /**
     * onSubmit callback.
     *
     * Only called if:
     * - The form is not already being submitted (`submitting.value` is falsy).
     * - HTML5 validation passes (if enabled).
     * - Standard Schema validation passes.
     *
     * The first argument is the validated input; the remaining arguments are passed through from the submit function.
     *
     * While submission is in progress, `submitting` is true.
     * After successful execution, `submitted` is true.
     */
    onSubmit?: SubmitCallback<[StandardSchemaV1.InferOutput<TSchema>, ...TArgs], TResult>
  },
): UseSubmitReturn<TArgs, TResult, TErrors>

//
// No input, separate submit.
//

/**
 * Vue 3 composable for handling form submission.
 */
export function useSubmit<Args extends unknown[], Result, TErrors = StandardErrors>(
  options: BaseOptions<TErrors> & {
    input?: never
    schema?: never
    onSubmit?: never
  },
  onSubmit: SubmitCallback<Args, Result>,
): UseSubmitReturn<Args, Result, TErrors>

//
// Input only (no schema), separate submit.
//

/**
 * Vue 3 composable for handling form submission.
 */
export function useSubmit<TInput, TArgs extends any[], TResult, TErrors = StandardErrors>(
  options: BaseOptions<TErrors> & {
    input: MaybeRefOrGetter<TInput>
    schema?: never
    onSubmit?: never
  },
  onSubmit: SubmitCallback<[TInput, ...TArgs], TResult>,
): UseSubmitReturn<TArgs, TResult, TErrors>

//
// Schema, separate submit.
//

/**
 * Vue 3 composable for handling form submission.
 */
export function useSubmit<TSchema extends StandardSchemaV1, TArgs extends any[], TResult, TErrors = StandardErrors>(
  options: BaseOptions<TErrors> & {
    input?: unknown
    schema: MaybeRefOrGetter<TSchema>
    onSubmit?: never
  },
  onSubmit: SubmitCallback<[StandardSchemaV1.InferOutput<TSchema>, ...TArgs], TResult>,
): UseSubmitReturn<TArgs, TResult, TErrors>

//
// No input, callback only.
//

/**
 * Vue 3 composable for handling form submission.
 */
export function useSubmit<TArgs extends any[], TResult>(
/**
 * onSubmit callback.
 *
 * Only called if:
 * - The form is not already being submitted (`submitting.value` is falsy).
 * - HTML5 validation passes (if enabled).
 *
 * Arguments are passed through from the submit function.
 *
 * While submission is in progress, `submitting` is true.
 * After successful execution, `submitted` is true.
 */
  onSubmit?: SubmitCallback<TArgs, TResult>,
): UseSubmitReturn<TArgs, TResult, StandardErrors>

//
// Implementation.
//

export function useSubmit(
  optionsOrOnSubmit?:
    | (BaseOptions<unknown> & {
      input?: unknown
      schema?: MaybeRefOrGetter<StandardSchemaV1>
      onSubmit?: SubmitCallback<unknown[], unknown>
    })
    | SubmitCallback<unknown[], unknown>,
  externalOnSubmit?: SubmitCallback<unknown[], unknown>,
): UseSubmitReturn<unknown[], unknown, unknown> {
  const options
    = (typeof optionsOrOnSubmit === "function" ? undefined : optionsOrOnSubmit) ?? {}
  const onSubmitCallback
    = typeof optionsOrOnSubmit === "function" ? optionsOrOnSubmit : externalOnSubmit ?? options?.onSubmit
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
        const returnValue = await (
          hasInput || parseResult
            ? onSubmitCallback?.(parseResult ? parseResult.value : input, ...args)
            : onSubmitCallback?.(...args)
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
