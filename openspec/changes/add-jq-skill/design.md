## Context

The repository already registers `skills` as an OpenCode skill search path and
contains one model-invoked, instruction-only skill. No configuration or package
change is needed. See `proposal.md` for motivation and
`specs/agent-jq-guidance/spec.md` for required behavior.

jq guidance for an agent has a different failure profile from a normal command
cookbook. The source may be a persistent file, disposable stdout, a unique
state-changing response, or structured data visible only inside a tool result.
An incorrect filter can therefore range from a cheap retry to permanent loss of
the only observation. Reducing output also creates a competing risk: a compact
view can omit record identity, pagination scope, producer failures, or evidence
needed to challenge the result.

The official jq documentation is licensed under CC BY 3.0 while this repository
is MIT licensed. The implementation must synthesize behavior, use original
examples, and preserve attribution without copying the manual as a local
replacement.

## Goals / Non-Goals

**Goals:**

- Make jq a deliberate JSON-boundary tool for agents rather than a reflex for
  every structured result.
- Preserve valuable source evidence while still allowing cheap, verified,
  read-only commands to be filtered before they consume context.
- Make every jq view traceable, cardinality-aware, and explicit about its
  completeness scope.
- Keep routine guidance compact while retaining a verifiable jq 1.3 through 1.8
  compatibility reference.
- Make version claims survive time by using objective version labels and an
  explicit evidence vocabulary instead of relative wording such as "recently."
- Keep common use independent of a live documentation fetch while requiring
  source verification during implementation and for unresolved edge cases.

**Non-Goals:**

- Mirror the jq manual or enumerate every builtin in `SKILL.md`.
- Install, upgrade, build, or configure jq.
- Treat jq-like selectors in other tools, gojq, yq, JSONPath, JMESPath, JSONC,
  or JSON5 as interchangeable with the jq executable.
- Replace specialized tools or higher-priority runtime instructions.
- Use jq as proof of strict single-document RFC JSON validity.
- Make in-place JSON mutation the default or use jq to modify generated
  manifests and lockfiles that have a domain-specific owner.
- Promise exact large-number, C math, date, regex, or platform behavior from a
  version string alone.

## Decisions

### Use one model-invoked skill with one progressively disclosed reference

Create this package:

```text
skills/jq/
|-- SKILL.md
`-- references/
    `-- version-compatibility.md
```

`SKILL.md` will contain the behavior every branch needs: source classification,
the replay gate, result contracts, shell and data boundaries, jq cardinality,
non-destructive file analysis, verification, and a compact map of practical
uses. Its model-facing description will trigger when an agent is about to
write, run, explain, review, or debug jq; reduce an accessible JSON source; or
assess jq compatibility.

The version reference will contain the manual links, evidence vocabulary,
high-risk compatibility deltas, recently added named capabilities, and
fallbacks. `SKILL.md` will include a context pointer requiring that reference
before using a version-sensitive capability, targeting an older jq, or
answering a version-history question.

Alternatives considered:

- A single exhaustive file would avoid a missed pointer but would load a large
  historical reference into every simple projection request.
- A user-invoked skill would reduce context load but would not help an agent
  proactively reduce large command or file output.
- Separate skills for files, pipelines, and compatibility would duplicate jq
  semantics and make source classification less reliable.

### Treat source data as evidence and jq output as a view

The central model will be:

```text
                           JSON source
                                |
          +---------------------+----------------------+
          |                     |                      |
          v                     v                      v
   persistent file      ephemeral producer     tool-managed result
          |                     |                      |
          |               replay gate           reachable bytes?
          |                /       \              /        \
          |              yes       no           yes        no
          |               |         |             |          |
          |          direct view  snapshot     query it   use native
          |                         first                    facility
          +-------------------------+-------------+
                                                    |
                                         decision-complete view
```

This separates four operational cases:

| Source class                                                                     | Default treatment                                                       |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Persistent jq-compatible file                                                    | Query read-only and revise views against the same source.               |
| Cheap, read-only, sufficiently repeatable producer                               | Direct filtering is allowed after schema and filter preflight.          |
| Stateful, unique, expensive, rate-limited, time-sensitive, or uncertain producer | Preserve complete stdout and producer status before jq.                 |
| Tool result without accessible bytes, path, handle, selector, or safe replay     | Use the tool's facilities or reason directly; do not invent a pipeline. |

"Repeatable" is stronger than "read-only." A status query, log stream, random
sample, or concurrently changing resource can be side-effect-free while still
representing an observation that cannot be recreated exactly.

Alternatives considered:

- Always pushing filters to the producer minimizes bytes but can discard fields
  before the agent knows they are needed and can destroy a one-time response.
- Always capturing first maximizes recoverability but adds latency, disk use,
  secret-handling risk, and unnecessary process steps for stable local queries.
- Treating an in-context tool object as shell stdin would describe an access
  path that usually does not exist.

### Put a replay gate before every disposable pipeline

Direct `producer | jq ...` use requires all of these observations:

1. The producer has no unwanted side effects.
2. The observation can be recreated well enough for the decision.
3. Repeating it is acceptably cheap and does not consume a problematic quota.
4. The JSON shape is known or has a representative verified sample.
5. The jq filter has been preflighted for syntax, shape, and expected
   cardinality.
6. Producer and jq failures remain independently observable in the target
   shell or execution tool.

If any observation is unresolved, the safe sequence is:

```text
producer
   |
   +-> complete stdout snapshot
   +-> separate stderr and producer status
                    |
                    v
              validate JSON shape
                    |
                    v
             run and revise jq views
                    |
                    v
        verify identifiers/counts/scope/status
                    |
                    v
           release snapshot when safe
```

The implementation will prefer an existing tool-managed full-output path or
handle, then an environment-approved secure temporary location. It will not
prescribe a repository file for transient output or retain a sensitive snapshot
longer than necessary.

A `tee` pipeline is not sufficient for irreplaceable output. An early jq exit,
closed downstream pipe, `tee` failure, or disk error can leave a partial copy,
and shells without correctly handled pipeline status can hide which stage
failed. `tee` may be discussed only as best-effort live observation for a source
whose loss is acceptable, never as the capture-first guarantee.

Alternatives considered:

- `tee` keeps streaming latency low but couples capture completeness to the
  health and lifetime of the downstream pipeline.
- Shell command substitution avoids a file but is unsuitable for large output,
  binary delimiters, secrets, and stable status handling.
- Rerunning a failed query is acceptable only after the replay gate has already
  classified the producer as disposable.

### Define a decision-complete result contract before final filtering

The skill will guide the agent to establish:

```text
source shape + desired records + retained fields + 0/1/N cardinality
             + output encoding + completeness scope + consumer
```

Compact output is not enough. A projection should normally retain record IDs or
names, values needed for the decision, and evidence of scope such as source and
match counts, filenames, fetched pages, or an explicit sample/window label.
Aggregates over incomplete pagination or truncated tool output cannot be called
global totals.

Schema discovery will be strict-first. The agent will inspect bounded type,
keys, and representative shape before introducing `?`, `try`, `// empty`, or
other constructs that turn a mistaken path into plausible silence. Empty output
will trigger checks of producer status, source shape, predicate, optionality,
and expected cardinality before it is interpreted as no matches.

The core reference will explain jq's generator model and track expressions as
producing zero, one, or many results. It will distinguish iteration from array
collection, defaulting from error suppression, JSON output from raw output, and
filter truth from process exit status.

Alternatives considered:

- A cookbook of short filters is easier to scan but encourages copying commands
  without understanding shape, cardinality, or completeness.
- Making every result carry a large diagnostics envelope wastes context; the
  richer envelope is required during discovery and verification, then can be
  reduced once the view is trusted.

### Keep file analysis read-only by default

Persistent JSON files are already snapshots, so jq can query them repeatedly
without a replay gate. The skill will emphasize high-value agent cases such as
package manifests, API schemas, test and coverage reports, bundle statistics,
SBOMs, exported configurations, and NDJSON logs. It will still prefer a
specialized read or domain tool when that tool answers the question directly.

The skill will block `jq FILTER file > file`, because the shell opens and
truncates the output before jq reads the input. An explicitly requested
transformation must produce a separate candidate, parse and shape-check it, and
only then hand replacement to the environment's appropriate file-editing
mechanism. Generated manifests and lockfiles remain owned by their generators.

The input guidance will say "jq-compatible JSON" rather than "strict JSON."
jq does not parse JSONC or JSON5 comments and trailing commas, but it accepts
multiple top-level JSON values and numeric extensions such as `NaN` and
`Infinity`. Therefore successful parsing is not strict RFC validation.

### Keep shell syntax and data on separate channels

The skill will derive quoting from the target shell and will not interpolate
external data into jq source. It will use jq's argument and file mechanisms for
strings, parsed JSON, raw file text, JSON files, and positional values. Complex
filters may be placed in a filter file when the user asks for maintainable code,
but an ad hoc agent query will not create repository files merely to avoid
quoting.

Output mode will follow the consumer:

| Consumer                                       | Preferred contract                                                                           |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Agent inspection or another JSON parser        | Preserve JSON types; compact only when it improves context use.                              |
| Human or line-oriented text consumer           | Use raw or formatted output only after defining escaping and record boundaries.              |
| Downstream process receiving arbitrary strings | Use a safe delimiter supported by both sides; avoid shell word splitting and `eval`.         |
| Shell gate                                     | Emit one deliberate boolean/result and verify jq's exit semantics for the installed version. |

The skill will note Unix, PowerShell, and `cmd.exe` quoting differences from the
manual without claiming that one command string is portable across all three.

### Use an evidence ladder for version claims

Implementation must re-open and compare every required official manual:

| Version | Source and role                                                                                 |
| ------- | ----------------------------------------------------------------------------------------------- |
| jq 1.8  | [Current behavioral authority](https://jqlang.org/manual/v1.8/)                                 |
| jq 1.7  | [Previous manual and first comparison for 1.8](https://jqlang.org/manual/v1.7/)                 |
| jq 1.6  | [Compatibility baseline preceding 1.7](https://jqlang.org/manual/v1.6/)                         |
| jq 1.5  | [Predecessor needed for the explicit update-assignment change](https://jqlang.org/manual/v1.5/) |
| jq 1.4  | [Pre-module and pre-streaming historical comparison](https://jqlang.org/manual/v1.4/)           |
| jq 1.3  | [Earliest manual in the requested comparison](https://jqlang.org/manual/v1.3/)                  |

The skill and version reference will use this evidence vocabulary:

| Label                      | Required evidence                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `documented in jq X`       | The named behavior is present in that manual.                                                |
| `first documented in jq X` | It is present in X and absent from the immediately preceding compared manual.                |
| `changed in jq X`          | The manuals contain an explicit behavior delta or compatibility note.                        |
| `introduced in jq X`       | Official release or equivalent source evidence explicitly confirms addition or support.      |
| `requires runtime probe`   | Version is insufficient because build, platform, vendor, or implementation changes behavior. |

For the two newest minor lines, introduction claims will also use the official
[jq 1.7 release](https://github.com/jqlang/jq/releases/tag/jq-1.7) and
[jq 1.8.0 release](https://github.com/jqlang/jq/releases/tag/jq-1.8.0).
Examples of release-confirmed additions suitable for objective labels include:

- jq 1.7: `pick`, `--raw-output0`, `debug(msgs)`, `abs`, and implemented
  `scan(regex; flags)` support;
- jq 1.8.0: `--library-path`, `trim`, `ltrim`, `rtrim`, `trimstr`, `toboolean`,
  `add(generator)`, `skip`, and `@urid`.

`--stream-errors` is first documented in the jq 1.7 manual but will not be
called introduced without separate release evidence. `repeat` demonstrates the
inverse trap: it received a dedicated heading in 1.7 but appeared in earlier
manual text. Manual omission likewise will not be represented as runtime
removal without corroboration.

High-risk compatibility notes will include:

- Multi-output RHS under `|=`: jq 1.5 and earlier manuals use the last
  result; jq 1.6 and later specify the first.
- Empty RHS under `|=`: deletion is documented from jq 1.6.
- `recurse(f)`: the jq 1.5 manual stops on null; jq 1.6 and later describe
  unconditional recursion.
- String multiplication by zero: jq 1.5 and 1.6 manuals say `null`; jq 1.7
  and later say an empty string.
- `--argfile`: added in 1.4, discouraged in 1.5 and 1.6, and removed in the
  jq 1.7 release; generate `--slurpfile` or `--rawfile` instead.
- String search indexes: jq 1.8.0 changes `indices`, `index`, and `rindex`
  from byte positions to Unicode code-point positions.
- `tonumber` whitespace: jq 1.8.0 rejects leading and trailing whitespace;
  portable filters must normalize intentionally.
- Binding precedence and `--indent 0`: jq 1.8.0 changed behavior; use
  explicit parentheses and `-c` for intentional compact output.
- Number-literal preservation: documented from 1.7 and explicitly
  build-dependent in 1.8; arithmetic still risks IEEE-754 conversion.

When execution is permitted, observed target behavior outranks an inferred
version. The agent will inspect `jq --version`, relevant help, builtin
availability, build configuration, or a controlled semantic probe as needed.
Vendor suffixes and embedded jq-like implementations must not be treated as a
guarantee of reference jq behavior.

Alternatives considered:

- Calling every adjacent-manual addition "introduced" is disproved by features
  that were documented before implementation or received headings after they
  already existed.
- The word "recent" becomes stale; objective version labels remain accurate.
- Fetching all six manuals on every invocation is expensive and unnecessary for
  stable core behavior, but a one-time implementation audit and a retained
  reference keep the evidence reviewable.

### Paraphrase the manuals and use original examples

The skill will link to the official manuals and releases as its authorities but
will not reproduce their prose or example corpus. Explanations will focus on
agent-specific decisions, and verification cases will use original JSON and
commands. This keeps the skill concise, reduces context load, and respects the
documentation's CC BY 3.0 attribution requirements within an MIT repository.

## Risks / Trade-offs

- [A proactive model-invoked skill may overuse jq] -> Gate use on an accessible
  structured-data boundary and prefer specialized tools or direct inspection
  when they are narrower.
- [Direct filtering can destroy an irreplaceable observation] -> Apply the
  replay gate and use sequential capture-first handling whenever any condition
  is uncertain.
- [Capture-first can persist secrets or consume significant disk] -> Prefer
  tool-managed protected output, use environment-approved temporary storage,
  keep stdout out of context, and release the snapshot promptly after
  verification.
- [A syntactically valid query can produce a plausible but wrong empty result]
  -> Use strict-first schema discovery, explicit cardinality expectations, and
  source/match provenance before optional suppression.
- [Pagination, source limits, and tool truncation can invalidate aggregates] ->
  Carry completeness scope into the result and prohibit global claims over a
  partial source.
- [jq version labels may still miss vendor, platform, or build differences] ->
  Probe the actual implementation for behavior that affects correctness.
- [The compatibility reference can become long] -> Include only behavior the
  skill recommends or warns about, and keep the full topic inventory in the
  external manuals rather than copying it locally.
- [Instruction-only enforcement is probabilistic] -> Use a blocking source and
  result pipeline with observable completion criteria and scenario-based manual
  verification.
- [Documentation adaptation can blur licensing] -> Cite the CC BY 3.0 sources,
  paraphrase facts, and create original examples.

## Migration Plan

1. Re-open all six versioned manuals and the jq 1.7 and 1.8.0 release notes,
   then establish the final evidence matrix before writing version claims.
2. Add `skills/jq/SKILL.md` with source classification, replay safety, result
   contracts, core jq semantics, file safety, shell boundaries, and context
   pointers.
3. Add `skills/jq/references/version-compatibility.md` with source links,
   objective labels, confirmed compatibility deltas, and practical fallbacks.
4. Exercise the skill against file, repeatable-command, non-repeatable-command,
   materialized-tool-result, and context-only scenarios, including failure and
   incomplete-data cases.
5. Validate common behavior against the locally installed `jq-1.7.1-apple` and
   use an isolated jq 1.8 runtime for 1.8-specific examples when available.
6. Run the repository's formatting and lint checks and verify the package adds
   no executable or dependency.
7. Restart OpenCode so configuration-time skill discovery loads the new skill.

Rollback consists of removing `skills/jq/`. No persisted application data,
configuration migration, or package rollback is involved.
