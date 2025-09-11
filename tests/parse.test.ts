import { reactive } from "@vue/reactivity"
import * as v from "valibot"
import { expect, test } from "vitest"
import { flatten, useParse } from "vue-standard-schema"
import * as z from "zod"

test("parse with valibot", async () => {
  const input = reactive({
    age: "" as string | number,
  })

  const { output, errors } = useParse({
    input,
    schema: v.object({
      age: v.number(),
    }),
    formatErrors: flatten,
  }, {
    flush: "sync",
  })

  expect(output.value).toBeUndefined()
  expect(errors.value).toMatchObject({
    nested: {
      age: ["Invalid type: Expected number but received \"\""],
    },
  })

  input.age = 0

  expect(output.value).toEqual({ age: 0 })
  expect(errors.value).toBeUndefined()
})

test("parse with zod", async () => {
  const input = reactive({
    email: "",
  })

  const { output, errors } = useParse({
    input,
    schema: z.object({
      email: z.email("Invalid email"),
    }),
    formatErrors: flatten,
  }, {
    flush: "sync",
  })

  expect(output.value).toBeUndefined()
  expect(errors.value).toMatchObject({
    nested: {
      email: ["Invalid email"],
    },
  })

  input.email = "test@example.com"

  expect(output.value).toEqual({ email: "test@example.com" })
  expect(errors.value).toBeUndefined()
})
