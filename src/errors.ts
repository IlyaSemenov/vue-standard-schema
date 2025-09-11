import type { StandardSchemaV1 } from "@standard-schema/spec"

/**
 * The FlatErrors interface, compatible with valibot.
 */
export interface FlatErrors<TSchema extends StandardSchemaV1 = StandardSchemaV1> {
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
    // This is not entirely correct because it doesn't account to sub-nested fields.
    [Key in keyof StandardSchemaV1.InferInput<TSchema>]: string[]
  }>
}

export type GenericFlatErrors = FlatErrors<any>

export function flattenIssues<TSchema extends StandardSchemaV1>(
  issues: readonly StandardSchemaV1.Issue[],
): FlatErrors<TSchema> {
  const flatErrors: FlatErrors<TSchema> = {}

  for (const issue of issues) {
    if (!issue.path || issue.path.length === 0) {
      // Root level error
      if (!flatErrors.root) {
        flatErrors.root = []
      }
      flatErrors.root.push(issue.message)
    } else {
      // Nested field error
      if (!flatErrors.nested) {
        flatErrors.nested = {}
      }
      const pathSegment = issue.path[0]
      const key = (typeof pathSegment === "object" && pathSegment !== null && "key" in pathSegment
        ? pathSegment.key
        : pathSegment) as keyof StandardSchemaV1.InferInput<TSchema>
      if (!flatErrors.nested[key]) {
        flatErrors.nested[key] = []
      }
      flatErrors.nested[key]!.push(issue.message)
    }
  }

  return flatErrors
}
