import * as v from "valibot"
import { expectTypeOf, test } from "vitest"
import { useForm } from "vue-standard-schema"

test("callback args", () => {
  const { submit } = useForm({
    schema: v.string(),
    async submit(input, _arg1: number, _arg2: boolean) {
      expectTypeOf(input).toEqualTypeOf<string>()
    },
  })
  // @ts-expect-error arg1 is required
  submit()
  // @ts-expect-error arg2 is required
  submit(123)
  submit(123, true)
})

test("optional callback arg", () => {
  const { submit } = useForm({
    schema: v.string(),
    async submit(input, _arg1: number, _arg2?: boolean) {
      expectTypeOf(input).toEqualTypeOf<string>()
    },
  })
  // @ts-expect-error arg1 is required
  submit()
  submit(123)
  submit(123, true)
})
