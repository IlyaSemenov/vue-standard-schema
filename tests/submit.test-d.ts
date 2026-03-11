import { ref } from "@vue/reactivity"
import { expectTypeOf, test } from "bun:test"
import * as v from "valibot"
import { useSubmit } from "vue-form-submit"
import * as z from "zod"

test("input with valibot schema", () => {
  useSubmit({
    input: { foo: "" as string | undefined },
    schema: v.object({
      foo: v.string(),
    }),
    async onSubmit(input) {
      expectTypeOf(input).toEqualTypeOf<{ foo: string }>()
    },
  })
})

test("input with zod schema", () => {
  useSubmit({
    input: { email: "" as string | undefined },
    schema: z.object({
      email: z.email(),
    }),
    async onSubmit(input) {
      expectTypeOf(input).toEqualTypeOf<{ email: string }>()
    },
  })
})

test("ref input with schema", () => {
  useSubmit({
    input: ref({ foo: "" as string | undefined }),
    schema: v.object({
      foo: v.string(),
    }),
    async onSubmit(input) {
      expectTypeOf(input).toEqualTypeOf<{ foo: string }>()
    },
  })
})

test("ref input without schema", () => {
  useSubmit({
    input: ref({ foo: "" as string | undefined }),
    async onSubmit(input) {
      expectTypeOf(input).toEqualTypeOf<{ foo: string | undefined }>()
    },
  })
})

test("input with undefined schema", () => {
  useSubmit({
    input: { foo: "" as string | undefined },
    schema: undefined,
    async onSubmit(input) {
      expectTypeOf(input).toEqualTypeOf<{ foo: string | undefined }>()
    },
  })
})

test("no onSubmit handler", () => {
  useSubmit({
    input: ref({ foo: "" as string | undefined }),
    schema: v.object({
      foo: v.string(),
    }),
  })
})

test("schema accepting partial lax-typed input", () => {
  useSubmit({
    input: { foo: 0 as "" | number, bar: 0 as "" | number },
    schema: v.object({
      foo: v.number(),
    }),
  })
})

test("dynamic schema", () => {
  useSubmit({
    schema: () =>
      v.object({
        foo: v.string(),
      }),
    onSubmit(input) {
      expectTypeOf(input).toEqualTypeOf<{ foo: string }>()
    },
  })
})

test("input without schema", () => {
  const { submit } = useSubmit({
    input: 123,
    async onSubmit(input, commit: boolean) {
      expectTypeOf(input).toEqualTypeOf<number>()
      return commit ? `${input}` : false
    },
  })
  expectTypeOf(submit).toEqualTypeOf<(commit: boolean) => Promise<string | false | undefined>>()
})

test("callback only", () => {
  const { submit } = useSubmit({
    async onSubmit(input: number) {
      return `${input}`
    },
  })
  expectTypeOf(submit).toEqualTypeOf<(input: number) => Promise<string | undefined>>()
})

test("callback shortcut", () => {
  const { submit } = useSubmit(() => 123)
  expectTypeOf(submit).toEqualTypeOf<() => Promise<number | undefined>>()
})

test("separate submit, no input", () => {
  const { submit } = useSubmit({}, async (input: number) => {
    return `${input}`
  })
  expectTypeOf(submit).toEqualTypeOf<(input: number) => Promise<string | undefined>>()
})

test("separate submit, with schema", () => {
  const { submit } = useSubmit(
    {
      input: { foo: "" as string | undefined },
      schema: v.object({ foo: v.string() }),
    },
    async (input) => {
      expectTypeOf(input).toEqualTypeOf<{ foo: string }>()
    },
  )
  submit()
})

test("separate submit, input without schema", () => {
  const { submit } = useSubmit(
    { input: 123 },
    async (input, commit: boolean) => {
      expectTypeOf(input).toEqualTypeOf<number>()
      return commit ? `${input}` : false
    },
  )
  expectTypeOf(submit).toEqualTypeOf<(commit: boolean) => Promise<string | false | undefined>>()
})
