# jq Version Compatibility

Read this reference before using a version-sensitive jq capability, targeting an
older or unknown jq, or making a version-history claim. The current behavioral
authority is the official [jq 1.8 manual](https://jqlang.org/manual/v1.8/).
Observed behavior from the target executable outranks version inference when a
vendor build, platform, or build option can change the result.

## Evidence Vocabulary

Use these labels exactly:

| Label                      | Evidence required                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `documented in jq X`       | The behavior is stated in that version's manual.                                                      |
| `first documented in jq X` | It is present in X and absent from the immediately preceding compared manual.                         |
| `changed in jq X`          | An official source states a behavior change or compatibility delta.                                   |
| `introduced in jq X`       | Official release evidence explicitly confirms an addition or implementation.                          |
| `removed in jq X`          | Official release evidence explicitly confirms removal.                                                |
| `requires runtime probe`   | Version alone is insufficient because implementation, vendor, build, or platform can change behavior. |

Manual absence establishes only documentation absence. It does not prove that a
runtime lacks a capability. A new heading also does not prove a new capability:
`repeat(exp)` appears in the jq 1.5 and 1.6 text but first receives a dedicated
heading in the jq 1.7 manual.

## Official Sources

Manuals, compared adjacently:

- [jq 1.8 manual](https://jqlang.org/manual/v1.8/) - current authority
- [jq 1.7 manual](https://jqlang.org/manual/v1.7/)
- [jq 1.6 manual](https://jqlang.org/manual/v1.6/)
- [jq 1.5 manual](https://jqlang.org/manual/v1.5/)
- [jq 1.4 manual](https://jqlang.org/manual/v1.4/)
- [jq 1.3 manual](https://jqlang.org/manual/v1.3/)

Release evidence:

- [jq 1.7 release](https://github.com/jqlang/jq/releases/tag/jq-1.7)
- [jq 1.8.0 release](https://github.com/jqlang/jq/releases/tag/jq-1.8.0)

Useful manual sections include
[invocation](https://jqlang.org/manual/v1.8/#invoking-jq),
[operators and builtins](https://jqlang.org/manual/v1.8/#builtin-operators-and-functions),
[assignment](https://jqlang.org/manual/v1.8/#assignment),
[streaming](https://jqlang.org/manual/v1.8/#streaming),
[regular expressions](https://jqlang.org/manual/v1.8/#regular-expressions),
[math](https://jqlang.org/manual/v1.8/#math), and
[modules](https://jqlang.org/manual/v1.8/#modules).

The manuals are licensed under CC BY 3.0. This reference paraphrases factual
behavior and uses original guidance and examples rather than reproducing the
manual or its example corpus.

## Probe The Target

Start with the actual executable when execution is allowed:

```sh
jq --version
jq --help
```

Use `--help` to check options and a minimal, controlled input to check semantics.
Do not infer reference-jq behavior from a vendor suffix or from a jq-like
implementation such as gojq or a selector embedded in another tool. Keep probes
read-only and test the exact behavior that affects the decision.

For build-sensitive number handling, inspect the available build information and
probe representative literals without exposing sensitive data:

```sh
jq -n 'have_literal_numbers, have_decnum'
jq -n '[100000000000000001, 100000000000000002] | {values: ., sum: add}'
```

An unknown builtin is itself evidence that the installed build needs a different
probe. Large integers used as identifiers should remain strings; arithmetic can
still force IEEE-754 conversion even when an unchanged literal prints exactly.

## Adjacent-Version Evidence Matrix

`silent` means the complete compared manual does not state the audited behavior.
It is not a runtime claim.

| Behavior                            | jq 1.3                                    | jq 1.4                                    | jq 1.5                                | jq 1.6                           | jq 1.7                         | jq 1.8                                    | Approved conclusion                                                                                                                                                                                        |
| ----------------------------------- | ----------------------------------------- | ----------------------------------------- | ------------------------------------- | -------------------------------- | ------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Multi-result update-assignment RHS  | silent                                    | silent                                    | last result                           | first result                     | first result                   | first result                              | `changed in jq 1.6`. The 1.6+ compatibility note says jq 1.5 and earlier releases used the last result; the 1.3/1.4 manuals themselves are silent.                                                         |
| Empty update-assignment RHS         | silent                                    | silent                                    | silent                                | deletes the path                 | deletes the path               | deletes the path                          | `first documented in jq 1.6`. Use `del(path)` when older compatibility matters.                                                                                                                            |
| Primary description of `recurse(f)` | example only; stopping condition unstated | example only; stopping condition unstated | equivalent to `recurse(f; . != null)` | equivalent to `recurse(f; true)` | same primary wording           | same primary wording                      | The primary manual description differs between jq 1.5 and 1.6, but a null-stopping definition remains elsewhere in the 1.6-1.8 manuals. Use an explicit condition; null behavior `requires runtime probe`. |
| String multiplied by zero           | silent                                    | silent                                    | `null`                                | `null`                           | empty string                   | empty string                              | `changed in jq 1.7`. Avoid using this edge case as control flow across versions.                                                                                                                           |
| Unmodified decimal literals         | silent                                    | silent                                    | silent                                | IEEE-754-only description        | literal preservation described | preservation plus build qualifications    | `first documented in jq 1.7`; exact behavior `requires runtime probe`. Arithmetic can lose precision.                                                                                                      |
| `--argfile`                         | silent                                    | first value documented                    | discouraged; scalar or array          | same as 1.5                      | absent                         | absent                                    | `first documented in jq 1.4`; jq 1.4 and 1.5 document different shapes; `removed in jq 1.7`. Modern file options are not drop-in replacements, and older shape behavior `requires runtime probe`.          |
| `--stream-errors`                   | silent                                    | silent                                    | silent                                | silent                           | first documented               | documented                                | `first documented in jq 1.7`. The release notes do not support calling it introduced.                                                                                                                      |
| `repeat(exp)`                       | silent                                    | silent                                    | documented in text                    | documented in text               | dedicated heading              | dedicated heading                         | `first documented in jq 1.5`; the jq 1.7 heading is not introduction evidence.                                                                                                                             |
| Literal `NaN` and `Infinity` input  | silent                                    | silent                                    | silent                                | silent                           | silent                         | release says plain forms remain supported | jq is not a strict RFC JSON validator. Older or vendor behavior `requires runtime probe`.                                                                                                                  |

### Assignment Compatibility

Plain assignment and update assignment have different data flow:

- `path = rhs` evaluates `rhs` against the assignment input and emits a modified
  root for each RHS result. This multi-result behavior is first documented in
  jq 1.5.
- `path |= rhs` evaluates `rhs` against the old value at each selected path. For
  a multi-result RHS, jq 1.5 uses the last result while jq 1.6+ specifies the
  first.
- An empty update RHS deletes the path in jq 1.6+ documentation. Use an explicit
  `del(path)` when targeting older versions.

Portable filters make an update RHS produce exactly one value and express
deletion explicitly. Test the final root shape, not only the updated scalar.

## Release-Confirmed jq 1.7 Changes

The [jq 1.7 release](https://github.com/jqlang/jq/releases/tag/jq-1.7)
supports these labels:

| Capability or behavior          | Approved label         | Compatibility action                                                                                                                                                                                                                   |
| ------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pick(stream)`                  | `introduced in jq 1.7` | On older jq, construct the required object or array projection explicitly.                                                                                                                                                             |
| `--raw-output0`                 | `introduced in jq 1.7` | On older jq, retain JSON encoding unless the consumer and an alternative delimiter can represent every value. Newline-delimited raw output is unsafe for arbitrary strings.                                                            |
| `debug(msgs)`                   | `introduced in jq 1.7` | `debug` is first documented in jq 1.5. On an older target, probe it and check what reaches stderr; never expose secrets for diagnostics.                                                                                               |
| `abs`                           | `introduced in jq 1.7` | Use an explicit sign test when older compatibility matters; account for numeric conversion.                                                                                                                                            |
| `scan($re; $flags)`             | `introduced in jq 1.7` | The release says the builtin was added after being documented but not implemented. Probe older targets or use a tested regex alternative.                                                                                              |
| `--argfile`                     | `removed in jq 1.7`    | Neither replacement preserves its variable shape automatically. `--slurpfile` (`first documented in jq 1.5`) always produces an array; `--rawfile` (`first documented in jq 1.6`) produces text. Choose and verify the required shape. |
| Decimal literal representation  | `changed in jq 1.7`    | Preserve identifiers as strings and probe any exact-number requirement.                                                                                                                                                                |
| String multiplication below one | `changed in jq 1.7`    | Do not depend on pre-1.7 behavior. The manuals specifically document zero changing from `null` to an empty string; write the intended branch explicitly.                                                                               |
| `-e` exit behavior              | `changed in jq 1.7`    | The release demonstrates truthy last output as 0, false/null as 1, and no output as 4. Probe older targets and always inspect producer failures separately.                                                                            |

The release also says `halt` and `halt_error` `changed in jq 1.7` to exit
immediately rather than continue with the next input. Probe an older target and
do not rely on later inputs being processed after either filter.

## Release-Confirmed jq 1.8.0 Changes

The [jq 1.8.0 release](https://github.com/jqlang/jq/releases/tag/jq-1.8.0)
supports these labels:

| Capability or behavior                               | Approved label           | Compatibility action                                                                                                                               |
| ---------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--library-path` long option                         | `introduced in jq 1.8.0` | `-L` is first documented in jq 1.5; probe earlier targets. It disables the builtin module search list, so supply intentional trusted paths.        |
| `trim`, `ltrim`, and `rtrim`                         | `introduced in jq 1.8.0` | On older jq, use an explicitly tested normalization whose ASCII or Unicode whitespace contract is stated.                                          |
| `trimstr`                                            | `introduced in jq 1.8.0` | `ltrimstr` and `rtrimstr` are first documented in jq 1.4. Guard for string input before composing them and verify the intended two-ended behavior. |
| `toboolean`                                          | `introduced in jq 1.8.0` | Preserve boolean inputs; map only strings `"true"` and `"false"`, and raise an error for every other value.                                        |
| `add(generator)` / `add/1`                           | `introduced in jq 1.8.0` | For a bounded generator, collect then use `add`; avoid that fallback for an unbounded or large stream.                                             |
| `skip(n; generator)` / `skip/2`                      | `introduced in jq 1.8.0` | Prefer source-side skipping or an incremental reduction; a collecting fallback is safe only for bounded input.                                     |
| `@urid`                                              | `introduced in jq 1.8.0` | Use a trusted URI decoder outside jq on older versions; do not improvise partial percent decoding.                                                 |
| String `indices`, `index`, and `rindex` positions    | `changed in jq 1.8.0`    | Results are Unicode code-point positions rather than byte positions. Probe exact offset requirements; code points are not grapheme clusters.       |
| `tonumber` surrounding whitespace                    | `changed in jq 1.8.0`    | jq 1.8 rejects it. Normalize with an explicit whitespace contract before conversion when normalization is intended.                                |
| Binding precedence                                   | `changed in jq 1.8.0`    | Parenthesize values and bindings so precedence is explicit on every target.                                                                        |
| `--indent 0`                                         | `changed in jq 1.8.0`    | It retains newlines with zero indentation. Use `-c` for intentional compact output.                                                                |
| Unary negation, `abs`, and `length` number precision | `changed in jq 1.8.0`    | Build configuration still matters; probe representative literals and avoid arithmetic on identifier-like values.                                   |

The release also records these relevant compatibility changes:

- `ltrimstr` and `rtrimstr` `changed in jq 1.8.0` to error on non-string
  input. Add an explicit type guard when a mixed input contract is valid.
- Negative `limit` counts `changed in jq 1.8.0` to error. Validate the count
  before invoking it.
- `last(empty)` `changed in jq 1.8.0` to emit no result. State and test the
  empty-generator case when one output is required.
- `pow10` was `removed in jq 1.8.0`; use `exp10` only after checking the target.
- Payload-bearing NaN syntax was `removed in jq 1.8.0`; plain `NaN` and
  `Infinity` remain accepted by reference jq 1.8.0. Use a strict validator when
  those extensions must be rejected.

## First-Documented Invocation Floors

These are documentation floors, not proof of implementation introduction:

| Capability                                                             | First compared manual that documents it |
| ---------------------------------------------------------------------- | --------------------------------------- |
| `--null-input`, `--raw-input`, `--slurp`, `--raw-output`, `--arg`      | jq 1.3                                  |
| `--unbuffered`                                                         | jq 1.4                                  |
| `--stream`, `--seq`, `--join-output`, `--argjson`, `--slurpfile`, `-L` | jq 1.5                                  |
| `--rawfile`, `--args`, `--jsonargs`                                    | jq 1.6                                  |
| `--stream-errors`, `--raw-output0`                                     | jq 1.7                                  |
| `--library-path` long spelling                                         | jq 1.8                                  |

All six compared manuals describe input as a sequence of whitespace-separated
JSON values. A successful jq parse therefore does not prove that a source is one
strict RFC JSON document.

## Platform And Build Probes

Require a controlled probe when correctness depends on any of these:

- exact preservation, comparison, or arithmetic for decimal number literals;
- availability or behavior of a C math function;
- date parsing, formatting directives, timezone handling, or valid date range;
- regex details supplied by the linked regex library;
- Unicode byte, code-point, or grapheme offsets;
- module search paths or a vendor-provided jq-compatible implementation.

If execution is unavailable, a builtin probe is absent, or the result is
inconclusive, report the affected behavior as an unresolved compatibility
constraint. Do not replace missing evidence with a version-based assumption.

C math availability depends on the operating system and math library. Date
support is also platform-sensitive; the manuals specifically note directive and
date-range differences. Treat imported jq modules as code and load only trusted
files from intentional search paths.
