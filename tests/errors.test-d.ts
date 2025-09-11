import * as v from "valibot"
import { expectTypeOf, test } from "vitest"
import type { FlatErrors, StandardErrors } from "vue-standard-schema"
import { flatten, useForm } from "vue-standard-schema"
import * as z from "zod"

test("untyped errors without input", () => {
  const { errors } = useForm()
  expectTypeOf(errors.value).toEqualTypeOf<StandardErrors | undefined>()
})

test("untyped errors with input", () => {
  const { errors } = useForm({
    input: { foo: "Foo" },
    submit() {
      expectTypeOf(errors.value).toEqualTypeOf<StandardErrors | undefined>()
      errors.value = [{ message: "error", path: ["bar"] }]
    },
    onErrors(errors) {
      expectTypeOf(errors).toEqualTypeOf<StandardErrors>()
    },
  })
})

test("typed errors with valibot schema", () => {
  const schema = v.object({ foo: v.string() })
  const { errors } = useForm({
    schema,
    formatErrors: flatten,
    onErrors(errors) {
      expectTypeOf(errors).toEqualTypeOf<FlatErrors>()
      expectTypeOf(errors.nested?.foo).toEqualTypeOf<string[] | undefined>()
      // @ts-expect-error Property bar does not exist
      expectTypeOf(errors.nested?.bar).toEqualTypeOf<any>()
    },
  })
  expectTypeOf(errors.value).toEqualTypeOf<FlatErrors | undefined>()
})

test("typed errors with zod schema", () => {
  const schema = z.object({ email: z.string() })
  const { errors } = useForm({
    schema,
    formatErrors: flatten,
    onErrors(errors) {
      expectTypeOf(errors).toEqualTypeOf<FlatErrors>()
      expectTypeOf(errors.nested?.email).toEqualTypeOf<string[] | undefined>()
      // @ts-expect-error Property bar does not exist
      expectTypeOf(errors.nested?.bar).toEqualTypeOf<any>()
    },
  })
  expectTypeOf(errors.value).toEqualTypeOf<FlatErrors | undefined>()
})
