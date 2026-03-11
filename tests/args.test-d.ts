import { expectTypeOf, test } from "bun:test"
import * as v from "valibot"
import { useSubmit } from "vue-form-submit"

test("callback args", () => {
  const { submit } = useSubmit({
    schema: v.string(),
    async onSubmit(input, _arg1: number, _arg2: boolean) {
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
  const { submit } = useSubmit({
    schema: v.string(),
    async onSubmit(input, _arg1: number, _arg2?: boolean) {
      expectTypeOf(input).toEqualTypeOf<string>()
    },
  })
  // @ts-expect-error arg1 is required
  submit()
  submit(123)
  submit(123, true)
})

test("separate submit, callback args", () => {
  const { submit } = useSubmit(
    { schema: v.string() },
    async (input, _arg1: number, _arg2: boolean) => {
      expectTypeOf(input).toEqualTypeOf<string>()
    },
  )
  // @ts-expect-error arg1 is required
  submit()
  submit(123, true)
})
