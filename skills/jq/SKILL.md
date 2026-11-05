---
name: jq
description: >-
  jq guidance for writing, running, explaining, reviewing, or debugging jq;
  querying persistent JSON; reducing accessible JSON from commands, APIs, or
  materialized tool results; and checking compatibility. Explicit jq requests
  qualify without runnable input; otherwise use it only at a meaningful JSON
  boundary.
license: MIT
---

# jq

Use jq to reduce accessible JSON before irrelevant data enters context. Treat
the output as a view of the source, retaining enough evidence for the decision.
For writing, explanation, review, or debugging without runnable input, apply
relevant semantic, shell, and compatibility checks and state what is unverified.

## Choose The Shortest Useful Path

For a read-only query over a stable file with a known schema, run the minimal
filter directly. Inspect shape when it is unknown or results contradict
expectations; do not require a separate probe or snapshot for this path.

| Source                                                                           | Treatment                                                                     |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Persistent jq-compatible file                                                    | Query read-only and revise the view against the same source.                  |
| Cheap, side-effect-free, sufficiently repeatable producer                        | Pipe directly when each stage's failure is observable.                        |
| Stateful, unique, expensive, rate-limited, time-sensitive, or uncertain producer | Capture complete output and producer status before filtering.                 |
| Tool with a native selector or approved full-output path/handle                  | Prefer its selector when sufficient; otherwise query the materialized result. |
| Small JSON or a result visible only in context                                   | Reason directly or use native tool facilities; context is not shell stdin.    |
| JSONC, JSON5, YAML, XML, or another format                                       | Use a format-aware parser or explicit conversion.                             |

Before execution, identify actual bytes, a file, an approved handle, or a safe
producer path. Prefer a narrower source-side query when it preserves the needed
evidence. Read-only producers can still yield unique observations.

## Preserve Valuable Input

For a valuable or uncertain producer, use a tool-managed full-output handle or
approved secure temporary storage, outside the repository when possible:

1. Run the producer once; capture complete stdout, separate stderr, and status.
2. Check capture completeness and parseability. Valid JSON does not cancel a
   producer failure.
3. Inspect and query the snapshot. Check an unfamiliar or nontrivial filter
   against that snapshot before relying on its output.
4. Retain the source until the result is validated, then release it according to
   its sensitivity and retention requirements.

Never replay a valuable producer merely to repair a filter. A live `tee`
pipeline can leave a partial snapshot after an early exit or write failure; use
it only when loss is acceptable.

For direct pipelines, observe producer and jq failures separately. Bash exposes
`PIPESTATUS` and Zsh `pipestatus`; capture them immediately. `pipefail` alone
does not identify the failed stage. If stage statuses are unavailable, capture
first. Keep raw snapshots, stderr, and diagnostic output out of context when
they could disclose sensitive data.

## Define The Result

For unknown input, start with `jq 'type' data.json`, then bounded key, count, or
sample inspection. Omit sensitive key names; disclose sample size and
truncation. A sample does not establish full-input homogeneity.

Define records, retained fields, 0/1/N results per top-level input, encoding,
completeness scope, and the next consumer. Keep enough IDs, filenames, and
source/match counts to trace the result. Disclose pagination, limits, sampling,
and tool truncation; fetch all required pages before claiming a global total.

Every filter can emit zero, one, or many values. Pipe passes each left result
right; comma runs branches on the same input. `.[]` emits elements, `[expr]`
collects results, and `select` can drop inputs. Keep these distinctions
explicit:

- `has("x")` distinguishes an absent key from a present `null`.
- `a // b` falls back when `a` emits no non-`false`/non-`null` value; preserve
  legitimate `false` with explicit tests.
- `empty` emits no value. Use `?`, `try`, or `// empty` only for established
  optional or variant data; unexpected type errors are evidence.
- `path = rhs` evaluates RHS against the assignment input and emits a root per
  RHS result; `path |= rhs` uses the old path value. Prefer one RHS result and
  explicit `del(path)`; consult
  [assignment documentation](https://jqlang.org/manual/#assignment) for the
  target jq version when relying on other assignment behavior.

Before interpreting empty output as no matches, check statuses, shape, path,
predicate, optionality, scope, and expected cardinality.

## Keep Files Intact

For known shapes, simple views include:

```sh
jq '{name,version}' package.json
jq --arg status failed '[.tests[] | select(.status == $status) | {id,file}]' report.json
jq -c 'select(.level == "error") | {id,message}' events.ndjson
```

Reject `jq FILTER source.json > source.json`: redirection can truncate the
source before jq reads it. For a requested transformation, retain the original,
write a separate candidate, parse it and check statuses and expected
shape/cardinality, then use the environment-appropriate replacement mechanism.
Generated manifests and lockfiles remain owned by their generators.

jq accepts a stream of whitespace-separated JSON values, including NDJSON.
Parsing success does not establish one strict RFC JSON document; use a strict
format-aware validator when that is required. `del` removes only specified
paths, so redaction requires checking every secret location.

## Keep Code And Data Separate

| Shell / argument mode                                         | Filter quoting example      |
| ------------------------------------------------------------- | --------------------------- |
| POSIX `sh`, Bash, Zsh                                         | `jq '.["foo"]' data.json`   |
| PowerShell 7.3+ with `Standard` or `Windows` argument passing | `jq '.["foo"]' data.json`   |
| PowerShell with legacy native argument passing                | `jq '.[\"foo\"]' data.json` |
| `cmd.exe`                                                     | `jq ".[\"foo\"]" data.json` |

PowerShell quoting depends on `$PSNativeCommandArgumentPassing` and version:
7.3+ preserves embedded quotes in its modern modes, while legacy passing needs
the extra escaping. See Microsoft's
[native argument guidance](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing#passing-arguments-that-contain-quote-characters).

Keep external values out of jq source. Use `--arg` for strings, `--argjson` for
JSON, `--rawfile` for file text, `--slurpfile` for a parsed JSON stream, and
`--args`/`--jsonargs` for positionals. Use `-f` for a maintained trusted filter.
Avoid shell word splitting and `eval`; do not expose secrets to construct
queries.

For arbitrary strings, newline-delimited `-r` is unsafe. Keep JSON for JSON
consumers, or use `--raw-output0` when the target and consumer support it and
values cannot contain NUL. Protect the consumer from option-like values using
`--` or a non-option API. Materialize and validate output before a
side-effecting consumer when partial application would matter.

## Check Relevant Resource And Compatibility Constraints

Prefer source-side filtering and incremental `reduce`/`foreach` to collecting
large or unbounded input with `-s` or arrays. `--stream` changes input into a
path/value representation and requires a stream-aware filter. `--stream-errors`
and `--seq` can recover from malformed input; detect and disclose partial data.

Use `-c` for compact JSON. Sort keys or arrays only when their order is
irrelevant. `-e` derives status from the last output, with a distinct no-output
status; check the target if that behavior affects control flow.

For a version-sensitive feature or compatibility question, consult the relevant
section of the [official manual](https://jqlang.org/manual/) for the target
version and [release notes](https://github.com/jqlang/jq/releases) as needed. Do
not treat a feature's first documentation as proof of its introduction. When
execution is allowed, use `jq --version`, `jq --help`, or a minimal probe for
the behavior in question; otherwise state the unresolved constraint.

Keep large numeric identifiers as strings: exact literal output does not
guarantee exact arithmetic. Probe exact-number requirements, platform-dependent
math/dates, or vendor behavior only when they affect the result. Treat modules
as executable code and load only trusted modules.

## Before Relying On The Result

Check the conditions relevant to the task, without repeating satisfied checks:

- Producer and jq statuses support the claimed result.
- Shape, result count, provenance, and completeness match the intended view.
- Encoding, delimiters, ordering, and the consumer agree.
- Originals and valuable evidence remain available as needed; sensitive and
  temporary data follows retention requirements.
