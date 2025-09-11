import type { StandardSchemaV1 } from "@standard-schema/spec"

export type StandardErrors = readonly StandardSchemaV1.Issue[]

// TODO: accept Schema as a generic parameter, allow typed errors.
export type ErrorsFormatter<TErrors> = (issues: StandardErrors) => TErrors
