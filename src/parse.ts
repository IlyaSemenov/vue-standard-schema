import type { StandardSchemaV1 } from "@standard-schema/spec"
import { ref, toValue } from "@vue/reactivity"
import type { MaybeRefOrGetter, Ref, WatchOptionsBase } from "@vue/runtime-core"
import { watchEffect } from "@vue/runtime-core"

import type { ErrorsFormatter, StandardErrors } from "./errors"

export type UseParseReturn<TSchema extends StandardSchemaV1, TErrors = StandardErrors> = {
  result: Ref<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>
  output: Ref<StandardSchemaV1.InferOutput<TSchema> | undefined>
  errors: Ref<TErrors | undefined>
}

export function useParse<TSchema extends StandardSchemaV1, TErrors = StandardErrors>(
  options: {
    /**
     * The input data to validate (plain value, ref, or getter).
     */
    input?: unknown
    /**
     * A Standard Schema compatible schema (plain value, ref, or getter).
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

  function applyResult(r: StandardSchemaV1.Result<Output>) {
    result.value = r
    if (r.issues) {
      output.value = undefined
      errors.value = formatErrors(r.issues)
    } else {
      output.value = r.value
      errors.value = undefined
    }
  }

  watchEffect((onCleanup) => {
    const schema = toValue(options.schema)
    const input = toValue(options.input)
    const resultOrPromise = schema["~standard"].validate(input)

    if (resultOrPromise instanceof Promise) {
      let cancelled = false
      onCleanup(() => {
        cancelled = true
      })
      resultOrPromise.then((r) => {
        if (!cancelled) {
          applyResult(r)
        }
      })
    } else {
      applyResult(resultOrPromise)
    }
  }, watchOptions)

  return { result, output, errors }
}
