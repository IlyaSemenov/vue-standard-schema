import { getDotPath } from "@standard-schema/utils"

import type { StandardErrors } from "./base"

/**
 * The FlatErrors interface, compatible with Valibot.
 *
 * TODO: accept Schema as a generic parameter, allow typed errors.
 */
export interface FlatErrors {
  /**
   * Root-level errors.
   *
   * Contains error messages from issues without a path (belonging to the root of the schema).
   */
  root?: string[]
  /**
   * Nested field errors.
   *
   * Contains error messages from issues with a path (belonging to nested parts
   * of the schema), keyed by their dot-notation path.
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
