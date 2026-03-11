import { reactive, ref } from "@vue/reactivity"
import { expect, mock, test } from "bun:test"
import * as v from "valibot"
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
  expect(errors.value).toEqual({
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
  expect(errors.value).toEqual({
    nested: {
      email: ["Invalid email"],
    },
  })

  input.email = "test@example.com"

  expect(output.value).toEqual({ email: "test@example.com" })
  expect(errors.value).toBeUndefined()
})

test("result ref", () => {
  const input = ref(0)
  const { result, output, errors } = useParse({
    input,
    schema: v.pipe(v.number(), v.minValue(1, "Too small.")),
    formatErrors: flatten,
  }, { flush: "sync" })

  expect(result.value.issues).toBeDefined()
  expect(result.value.issues![0]!.message).toBe("Too small.")
  expect(output.value).toBeUndefined()
  expect(errors.value).toEqual({ root: ["Too small."] })

  input.value = 5

  expect(result.value.issues).toBeUndefined()
  expect((result.value as { value: unknown }).value).toBe(5)
  expect(output.value).toBe(5)
  expect(errors.value).toBeUndefined()
})

test("default errors format (raw StandardErrors)", () => {
  const input = ref("")
  const { errors } = useParse({
    input,
    schema: v.pipe(v.string(), v.minLength(1, "Required.")),
  }, { flush: "sync" })

  expect(Array.isArray(errors.value)).toBe(true)
  expect(errors.value![0]!.message).toBe("Required.")
})

test("dynamic schema (getter)", () => {
  const input = ref(1)
  const min = ref(2)
  const { errors } = useParse({
    input,
    schema: () => v.pipe(v.number(), v.minValue(min.value, `Min: ${min.value}.`)),
    formatErrors: flatten,
  }, { flush: "sync" })

  expect(errors.value).toEqual({ root: ["Min: 2."] })

  min.value = 0

  expect(errors.value).toBeUndefined()
})

test("async schema logs error and preserves previous state", () => {
  const consoleError = mock(() => {})
  const original = console.error
  console.error = consoleError

  try {
    // Start with a sync schema that validates successfully.
    const input = ref(1)
    const syncSchema = v.pipe(v.number(), v.minValue(1))
    const asyncSchema: v.GenericSchema = {
      "~standard": {
        version: 1,
        vendor: "test",
        validate: () => Promise.resolve({ value: 999 }) as any,
      },
    } as any
    const schema = ref<v.GenericSchema>(syncSchema)

    const { output, errors } = useParse({ input, schema }, { flush: "sync" })

    // Initial state: valid.
    expect(output.value).toBe(1)
    expect(errors.value).toBeUndefined()

    // Switch to async schema — should log, not update output/errors.
    schema.value = asyncSchema

    expect(consoleError).toHaveBeenCalledTimes(1)
    expect(consoleError.mock.calls[0]![0]).toMatch(/Promise/)
    // Previous state must be preserved.
    expect(output.value).toBe(1)
    expect(errors.value).toBeUndefined()
  } finally {
    console.error = original
  }
})
