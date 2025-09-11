# vue-valibot

## 1.0.0

### Major Changes

- 0e62eca: Return Standard Schema errors by default. Add `formatErrors` option, and provide backwards-compatible `flatten` formatter.
- 3908f77: Use `standard-schema` instead of `valibot`. Rename package to `vue-standard-schema`.

## 3.1.2

### Patch Changes

- d77da39: Allow Valibot 1.0.0 as peer dependency.

## 3.1.1

### Patch Changes

- 4137642: Remove `"engines"` from `package.json`.

## 3.1.0

### Minor Changes

- eaa3a00: Update to Valibot 0.32+ with the new pipe API.
- 92da316: Deprecate `SubmitError` (#23).

## 3.0.1

### Patch Changes

- 9285d84: Update valibot peer dependency semver to exclude incompatible versions (0.28+).

## 3.0.0

### Major Changes

- 790d7f7: Rename package to `vue-valibot`.

### Minor Changes

- 790d7f7: Add `useParse` composable.

## 2.0.0

### Major Changes

- 1721dce: Remove deprecated option `fields`.
- 847ceb0: Pass `input` to submit callback only if there is composable input and/or schema (#15). Otherwise, pass `submit` function arguments immediately. **BREAKING CHANGE:** in v1, `input` was always passed unless using the shortcut callback variant.

  Type `errors` as `FlatErrors<TSchema>` when using Valibot schema (#12).

## 1.7.1

### Patch Changes

- 47dfc55: Fix ESM export in package.json.

## 1.7.0

### Minor Changes

- 63c828b: Create dynamic schema with a getter function.

## 1.6.0

### Minor Changes

- 3de0e14: User-provided `form`, `submitting`, `submitted`, `errors` refs (#13).

## 1.5.0

### Minor Changes

- 0d00742: Option to throw `SubmitError`.

### Patch Changes

- ffce1e4: Remove typecheck on input parameters with schema defined.

## 1.4.1

### Patch Changes

- 6636705: Lax valibot dependency semver.

## 1.4.0

### Minor Changes

- afb9ef1: `onErrors` handler.
- 1a16732: Deprecate `fields`, rename it to `input`.

### Patch Changes

- a102b58: Fix `submitted` being `true` after submit handler set errors.

## 1.3.0

### Minor Changes

- cb8a455: Add `submitted` to the composable return.

## 1.2.1

### Patch Changes

- 57d54cb: Fix types for form and errors to allow undefined.

## 1.2.0

### Minor Changes

- bbb95ee: Pass submit arguments to submit callback.

## 1.1.0

### Minor Changes

- 997ce80: Shortcut syntax for passing submit handler only.

## 1.0.0

### Major Changes

- d3587d6: Initial release.
