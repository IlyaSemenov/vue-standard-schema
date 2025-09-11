import type { StandardSchemaV1 } from "@standard-schema/spec"
import { ref, toValue } from "@vue/reactivity"
import type { MaybeRefOrGetter, Ref, WatchOptionsBase } from "@vue/runtime-core"
import { watchEffect } from "@vue/runtime-core"

import { flattenIssues } from "./errors"
import type { FlatErrors } from "./errors"

export function useParse<TSchema extends StandardSchemaV1>(options: {
  /**
   * Input data to be validated (plain value, ref or getter).
   */
  input?: unknown
  /**
   * Standard Schema compatible schema (plain value, ref or getter).
   */
  schema: MaybeRefOrGetter<TSchema>
}, watchOptions?: WatchOptionsBase) {
  const result = ref() as Ref<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>> // Knowingly not empty.
  const output = ref<StandardSchemaV1.InferOutput<TSchema>>()
  const errors = ref<FlatErrors<TSchema>>()
  watchEffect(() => {
    const schema = toValue(options.schema)
    const input = toValue(options.input)
    const result = schema["~standard"].validate(input)
    if (result instanceof Promise) {
      throw new TypeError("Synchronous validation required, but schema returned a Promise.")
    }
    if (result.issues) {
      output.value = undefined
      errors.value = flattenIssues<TSchema>(result.issues)
    } else {
      output.value = result.value
      errors.value = undefined
    }
  }, watchOptions)
  return { result, output, errors }
}
