import type { StandardSchemaV1 } from "@standard-schema/spec"
import { ref, toValue } from "@vue/reactivity"
import type { MaybeRefOrGetter, Ref, WatchOptionsBase } from "@vue/runtime-core"
import { watchEffect } from "@vue/runtime-core"

import type { ErrorsFormatter, StandardErrors } from "./errors"

export type UseParseReturn<TSchema extends StandardSchemaV1, TErrors = StandardErrors> = {
  result: Ref<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>
  output: Ref<StandardSchemaV1.InferOutput<TSchema>>
  errors: Ref<TErrors | undefined>
}

export function useParse<TSchema extends StandardSchemaV1, TErrors = StandardErrors>(
  options: {
    /**
     * Input data to be validated (plain value, ref or getter).
     */
    input?: unknown
    /**
     * Standard Schema compatible schema (plain value, ref or getter).
     */
    schema: MaybeRefOrGetter<TSchema>
    /**
     * Error formatter function that transforms raw Standard Schema issues into the desired format.
     */
    formatErrors?: ErrorsFormatter<TErrors>
  },
  watchOptions?: WatchOptionsBase,
): UseParseReturn<TSchema, TErrors> {
  type Output = StandardSchemaV1.InferOutput<TSchema>
  const result = ref<StandardSchemaV1.Result<Output>>() as Ref<StandardSchemaV1.Result<Output>>
  const output = ref<Output>()
  const errors = ref<TErrors | undefined>()
  const formatErrors = options.formatErrors ?? ((issues: StandardErrors) => issues as TErrors)

  watchEffect(() => {
    const schema = toValue(options.schema)
    const input = toValue(options.input)
    const resultOrPromise = schema["~standard"].validate(input)

    if (resultOrPromise instanceof Promise) {
      console.error("Synchronous validation required, but schema returned a Promise.")
      return
    }

    result.value = resultOrPromise
    if (resultOrPromise.issues) {
      output.value = undefined
      errors.value = formatErrors(resultOrPromise.issues)
    } else {
      output.value = resultOrPromise.value
      errors.value = undefined
    }
  }, watchOptions)

  return { result, output, errors }
}
