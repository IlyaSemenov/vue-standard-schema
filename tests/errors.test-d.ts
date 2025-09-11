import * as v from "valibot"
import { expectTypeOf, test } from "vitest"
import type { FlatErrors, GenericFlatErrors } from "vue-standard-schema"
import { useForm } from "vue-standard-schema"
import * as z from "zod"

test("untyped errors without input", () => {
  const { errors } = useForm()
  expectTypeOf(errors.value).toEqualTypeOf<GenericFlatErrors | undefined>()
})

test("untyped errors with input", () => {
  const { errors } = useForm({
    input: { foo: "Foo" },
    submit() {
      expectTypeOf(errors.value).toEqualTypeOf<GenericFlatErrors | undefined>()
      errors.value = { nested: { bar: ["error"] } }
    },
    onErrors(errors) {
      expectTypeOf(errors).toEqualTypeOf<GenericFlatErrors>()
    },
  })
})

test("typed errors with valibot schema", () => {
  const schema = v.object({ foo: v.string() })
  const { errors } = useForm({
    schema,
    onErrors(errors) {
      expectTypeOf(errors).toEqualTypeOf<FlatErrors<typeof schema>>()
      expectTypeOf(errors.nested?.foo).toEqualTypeOf<string[] | undefined>()
      // @ts-expect-error Property bar does not exist
      expectTypeOf(errors.nested?.bar).toEqualTypeOf<any>()
    },
  })
  expectTypeOf(errors.value).toEqualTypeOf<FlatErrors<typeof schema> | undefined>()
})

test("typed errors with zod schema", () => {
  const schema = z.object({ email: z.string() })
  const { errors } = useForm({
    schema,
    onErrors(errors) {
      expectTypeOf(errors).toEqualTypeOf<FlatErrors<typeof schema>>()
      expectTypeOf(errors.nested?.email).toEqualTypeOf<string[] | undefined>()
      // @ts-expect-error Property bar does not exist
      expectTypeOf(errors.nested?.bar).toEqualTypeOf<any>()
    },
  })
  expectTypeOf(errors.value).toEqualTypeOf<FlatErrors<typeof schema> | undefined>()
})
