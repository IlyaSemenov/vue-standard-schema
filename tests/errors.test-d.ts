import * as v from "valibot"
import { expectTypeOf, test } from "vitest"
import type { GenericFlatErrors } from "vue-valibot"
import { useForm } from "vue-valibot"

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

test("typed errors with schema", () => {
  const schema = v.object({ foo: v.string() })
  const { errors } = useForm({
    schema,
    onErrors(errors) {
      expectTypeOf(errors).toEqualTypeOf<v.FlatErrors<typeof schema>>()
      expectTypeOf(errors.nested?.foo).toEqualTypeOf<[string, ...string[]] | undefined>()
      // @ts-expect-error Property bar does not exist
      expectTypeOf(errors.nested?.bar).toEqualTypeOf<any>()
    },
  })
  expectTypeOf(errors.value).toEqualTypeOf<v.FlatErrors<typeof schema> | undefined>()
})
