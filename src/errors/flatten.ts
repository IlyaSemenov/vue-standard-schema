import { getDotPath } from "@standard-schema/utils"

import type { StandardErrors } from "./base"

/**
 * The FlatErrors interface, compatible with Valibot.
 *
 * TODO: accept Schema as a generic parameter, allow typed errors.
 */
export interface FlatErrors {
  /**
   * The root errors.
   *
   * Hint: The error messages of issues without a path that belong to the root
   * of the schema are added to this key.
   */
  root?: string[]
  /**
   * The nested errors.
   *
   * Hint: The error messages of issues with a path that belong to the nested
   * parts of the schema and can be converted to a dot path are added to this
   * key.
   */
  nested?: Partial<{
    [key: string]: string[]
  }>
}

/**
 * Built-in error formatter that converts Standard Schema issues to FlatErrors format,
 * compatible with Valibot's flatten() function.
 */
export function flatten(issues: StandardErrors): FlatErrors {
  const errors: FlatErrors = {}
  for (const issue of issues) {
    const dotPath = getDotPath(issue)
    if (dotPath) {
      errors.nested ??= {}
      errors.nested[dotPath] ??= []
      errors.nested[dotPath]!.push(issue.message)
    } else {
      errors.root ??= []
      errors.root.push(issue.message)
    }
  }

  return errors
}
