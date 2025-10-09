import * as v from "valibot"
import { expectTypeOf, test } from "vitest"
import type { FlatErrors, StandardErrors } from "vue-standard-schema"
import { flatten, useParse } from "vue-standard-schema"

test("basic", () => {
  const { errors, output } = useParse({
    schema: v.object({
      age: v.number(),
    }),
  })
  expectTypeOf(output.value).toEqualTypeOf<{ age: number } | undefined>()
  expectTypeOf(errors.value).toEqualTypeOf<StandardErrors | undefined>()
})

test("formatted errors", () => {
  const { errors } = useParse({
    schema: v.object({
      age: v.number(),
    }),
    formatErrors: flatten,
  })
  expectTypeOf(errors.value).toEqualTypeOf<FlatErrors | undefined>()
  expectTypeOf(errors.value?.nested?.age).toEqualTypeOf<string[] | undefined>()
  // TODO: make this fail (name is not in schema)
  expectTypeOf(errors.value?.nested?.name).toEqualTypeOf<string [] | undefined>()
})
