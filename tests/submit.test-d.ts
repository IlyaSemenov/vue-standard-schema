import { ref } from "@vue/reactivity"
import * as v from "valibot"
import { expectTypeOf, test } from "vitest"
import { useForm } from "vue-valibot"

test("plain input with schema", () => {
  useForm({
    input: { foo: "" as string | undefined },
    schema: v.object({
      foo: v.string(),
    }),
    async submit(input) {
      expectTypeOf(input).toEqualTypeOf<{ foo: string }>()
    },
  })
})

test("ref input with schema", () => {
  useForm({
    input: ref({ foo: "" as string | undefined }),
    schema: v.object({
      foo: v.string(),
    }),
    async submit(input) {
      expectTypeOf(input).toEqualTypeOf<{ foo: string }>()
    },
  })
})

test("ref input without schema", () => {
  useForm({
    input: ref({ foo: "" as string | undefined }),
    async submit(input) {
      expectTypeOf(input).toEqualTypeOf<{ foo: string | undefined }>()
    },
  })
})

test("input with undefined schema", () => {
  useForm({
    input: { foo: "" as string | undefined },
    schema: undefined,
    async submit(input) {
      expectTypeOf(input).toEqualTypeOf<{ foo: string | undefined }>()
    },
  })
})

test("no submit handler", () => {
  useForm({
    input: ref({ foo: "" as string | undefined }),
    schema: v.object({
      foo: v.string(),
    }),
  })
})

test("schema accepting partial lax-typed input", () => {
  useForm({
    input: { foo: 0 as "" | number, bar: 0 as "" | number },
    schema: v.object({
      foo: v.number(),
    }),
  })
})

test("dynamic schema", () => {
  useForm({
    schema: () =>
      v.object({
        foo: v.string(),
      }),
    submit(input) {
      expectTypeOf(input).toEqualTypeOf<{ foo: string }>()
    },
  })
})

test("input without schema", () => {
  const { submit } = useForm({
    input: 123,
    async submit(input, commit: boolean) {
      expectTypeOf(input).toEqualTypeOf<number>()
      return commit ? `${input}` : false
    },
  })
  expectTypeOf(submit).toEqualTypeOf<(commit: boolean) => Promise<string | false | undefined>>()
})

test("callback only", () => {
  const { submit } = useForm({
    async submit(input: number) {
      return `${input}`
    },
  })
  expectTypeOf(submit).toEqualTypeOf<(input: number) => Promise<string | undefined>>()
})

test("callback shortcut", () => {
  const { submit } = useForm(() => 123)
  expectTypeOf(submit).toEqualTypeOf<() => Promise<number | undefined>>()
})
