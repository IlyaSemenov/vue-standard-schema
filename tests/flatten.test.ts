import { expect, test } from "bun:test"
import { flatten } from "vue-form-submit"

test("empty issues", () => {
  expect(flatten([])).toEqual({})
})

test("root errors only", () => {
  expect(flatten([
    { message: "Too short." },
    { message: "Invalid format." },
  ])).toEqual({
    root: ["Too short.", "Invalid format."],
  })
})

test("nested errors only", () => {
  expect(flatten([
    { message: "Required.", path: [{ key: "name" }] },
    { message: "Invalid email.", path: [{ key: "email" }] },
  ])).toEqual({
    nested: {
      name: ["Required."],
      email: ["Invalid email."],
    },
  })
})

test("multiple errors on the same field", () => {
  expect(flatten([
    { message: "Too short.", path: [{ key: "password" }] },
    { message: "Must contain a number.", path: [{ key: "password" }] },
  ])).toEqual({
    nested: {
      password: ["Too short.", "Must contain a number."],
    },
  })
})

test("mixed root and nested errors", () => {
  expect(flatten([
    { message: "Form is invalid." },
    { message: "Required.", path: [{ key: "name" }] },
    { message: "Invalid email.", path: [{ key: "email" }] },
    { message: "Too short.", path: [{ key: "email" }] },
  ])).toEqual({
    root: ["Form is invalid."],
    nested: {
      name: ["Required."],
      email: ["Invalid email.", "Too short."],
    },
  })
})

test("deeply nested field path", () => {
  expect(flatten([
    { message: "Required.", path: [{ key: "address" }, { key: "city" }] },
  ])).toEqual({
    nested: {
      "address.city": ["Required."],
    },
  })
})

test("numeric array index in path", () => {
  expect(flatten([
    { message: "Too short.", path: [{ key: "tags" }, { key: 0 }] },
    { message: "Required.", path: [{ key: "items" }, { key: 1 }, { key: "name" }] },
  ])).toEqual({
    nested: {
      "tags.0": ["Too short."],
      "items.1.name": ["Required."],
    },
  })
})
