## Purpose

Provide agents with deterministic, evidence-preserving guidance for deciding
when jq is appropriate and for safely querying, transforming, explaining, and
verifying accessible JSON across files, command output, and tool-managed data.

## ADDED Requirements

### Requirement: jq guidance is automatically discoverable

The repository SHALL provide a model-invoked skill named `jq` under the
configured `skills` search path. The skill SHALL contain instructions and
reference material only and SHALL NOT install jq, add executable code, or add a
runtime dependency.

#### Scenario: Agent receives an explicit jq request

- **WHEN** a user asks an agent to write, run, explain, review, or debug a jq
  filter or command
- **THEN** the jq skill is eligible for model invocation and supplies the
  complete decision and validation guidance

#### Scenario: Agent encounters a large accessible JSON source

- **WHEN** an agent needs a structural selection or computation over a large
  JSON file, repeatable command result, or materialized tool result
- **THEN** the jq skill is eligible for model invocation even when the user did
  not explicitly name jq

### Requirement: Guidance identifies where jq adds value

The skill SHALL describe practical agent uses for jq, including selecting and
projecting records, normalizing shapes, aggregating values, validating a
condition, redacting sensitive branches, producing deterministic comparison
views, and preparing typed or delimited output for another process. It SHALL
cover JSON files, JSON emitted by commands or APIs, and tool results that are
actually available as JSON bytes, a file, or a tool-supported selector. It
SHALL also identify when a specialized tool, source-side query, direct
inspection, or a format-specific parser is the better choice.

#### Scenario: Command exposes structured output

- **WHEN** a read-only command can emit JSON and the agent needs a small subset
  or aggregate
- **THEN** the guidance explains how jq can reduce the result before it enters
  agent context while retaining the evidence needed for the decision

#### Scenario: Repository contains a large JSON artifact

- **WHEN** an agent needs selected data from a package manifest, API schema,
  test report, coverage report, bundle statistic, SBOM, or other persistent JSON
  artifact
- **THEN** the guidance treats jq as a query over the existing file rather than
  requiring the whole document to be loaded into context

#### Scenario: jq would add no useful boundary

- **WHEN** the data is small and already visible, is not JSON, is better queried
  by a specialized tool, or is available only as an in-context object with no
  materialized JSON source
- **THEN** the agent does not introduce a fictitious or unnecessary jq pipeline

### Requirement: JSON source reachability is established before jq is chosen

Before constructing an invocation, the agent SHALL classify the source as a
persistent file, a sufficiently repeatable producer, a valuable or
non-repeatable producer, or a tool-managed result. The agent SHALL establish
how jq can receive the actual JSON and SHALL follow higher-priority tool and
runtime instructions. A result displayed in agent context SHALL NOT be treated
as shell stdin unless the environment provides an explicit path, handle,
selector, or repeatable retrieval mechanism.

#### Scenario: Tool provides a full-output path or result handle

- **WHEN** a tool materializes its complete JSON result and permits that result
  to be queried
- **THEN** the agent uses the supported path or retrieval mechanism without
  reissuing a stateful call

#### Scenario: Tool result exists only in context

- **WHEN** a tool result is visible to the agent but no JSON stream, file,
  selector, or safe replay mechanism is available
- **THEN** the agent reasons over the result directly or uses the tool's native
  facilities and does not claim that jq can consume it

### Requirement: Valuable ephemeral output survives uncertain filtering

Before directly piping a producer to jq, the agent SHALL establish that the
producer is side-effect-free, sufficiently repeatable for the decision,
acceptably cheap, not subject to a problematic rate limit, and paired with a
known input shape and a preflighted filter. If any condition is unresolved, the
agent SHALL preserve the producer's complete stdout separately from stderr,
record whether the producer succeeded, and only then query the preserved JSON.
The original output SHALL remain available until the jq view has been
validated. A live `tee` pipeline SHALL NOT be treated as the sole reliable
preservation mechanism for non-repeatable output.

#### Scenario: Cheap repeatable producer and verified filter

- **WHEN** a read-only producer can be safely repeated, its schema is known, the
  jq filter has been checked, and pipeline failures remain observable
- **THEN** the agent may filter the producer directly

#### Scenario: Mutating or time-sensitive producer

- **WHEN** a producer changes state, represents a unique observation, is
  expensive or rate-limited, or cannot be safely repeated
- **THEN** the agent completes and verifies a raw-output capture before running
  jq and does not repeat the producer merely to repair a filter

#### Scenario: jq filter fails after capture

- **WHEN** jq reports a compile error, runtime error, or implausible empty result
  while querying preserved output
- **THEN** the raw JSON and producer status remain available for diagnosis and a
  corrected query

#### Scenario: Downstream closes a live pipeline early

- **WHEN** jq or another downstream process exits early and can cause `tee` or
  the producer to receive a closed pipe
- **THEN** the agent does not represent the concurrently written copy as a
  guaranteed complete snapshot

### Requirement: jq output remains decision-complete

The agent SHALL define the required records, fields, output cardinality,
format, and completeness scope before finalizing a filter. A reduced result
SHALL retain identifying provenance and SHALL disclose pagination, source-side
limits, sampling, streaming windows, or tool truncation that constrain the
result. The agent SHALL distinguish a valid no-match result from a mistaken
path, suppressed error, producer failure, or incomplete page.

#### Scenario: Agent aggregates a paginated API result

- **WHEN** the user asks for a total or an exhaustive set from a paginated
  source
- **THEN** the agent obtains all required pages before the final jq aggregation
  or labels the result as partial

#### Scenario: Projection removes most source fields

- **WHEN** jq emits only the values relevant to a decision
- **THEN** the result retains the record identifiers and scope or count needed
  to trace each value and assess completeness

#### Scenario: Selection emits no values

- **WHEN** a filter produces no output
- **THEN** the agent verifies the source shape, producer status, predicate, and
  expected cardinality before concluding that there are no matches

### Requirement: JSON files are analyzed non-destructively

The skill SHALL treat existing JSON files as persistent evidence that can be
queried repeatedly. Read-only analysis SHALL be the default. The agent SHALL
NOT redirect jq output to the same path as its input. When a user explicitly
requests a file transformation, the original SHALL remain intact until a
separate result has parsed successfully and its intended shape has been
verified. The guidance SHALL distinguish jq-compatible input from JSONC, JSON5,
and strict single-document RFC JSON validation.

#### Scenario: Agent queries a persistent JSON file

- **WHEN** a file is valid input for jq and the agent only needs selected or
  computed data
- **THEN** the agent queries the file without changing it and can revise the
  filter without reacquiring the source

#### Scenario: Output path equals input path

- **WHEN** a proposed shell redirection would write jq output to the file jq is
  reading
- **THEN** the agent rejects that command because shell truncation can destroy
  the source before jq reads it

#### Scenario: File uses JSONC or JSON5 syntax

- **WHEN** a nominal JSON file contains comments, trailing commas, or another
  syntax unsupported by jq's input parser
- **THEN** the agent chooses a format-aware parser or conversion instead of
  presenting jq as compatible

#### Scenario: User requests strict JSON validation

- **WHEN** parsing success must prove one standards-compliant JSON document
- **THEN** the agent does not use jq alone as proof because jq accepts multiple
  top-level values and extensions such as `NaN` and `Infinity`

### Requirement: Commands preserve shell and data boundaries

Generated invocations SHALL follow the target shell's quoting rules. External
strings, JSON values, file contents, and positional arguments SHALL cross into
jq through the appropriate argument or file mechanism instead of being spliced
into jq source. The guidance SHALL avoid generated-shell evaluation, accidental
word splitting, and raw-output delimiters that cannot safely represent the
data. Sensitive values SHALL NOT be emitted into agent context merely to make a
query convenient.

#### Scenario: Filter compares an external string

- **WHEN** a shell variable or user-provided value participates in a jq
  predicate
- **THEN** the agent passes it as a jq argument and keeps the jq program
  structurally constant

#### Scenario: Arbitrary strings feed another process

- **WHEN** jq emits filenames or other strings that can contain whitespace or
  newlines for a downstream command
- **THEN** the agent chooses a delimiter and downstream consumption strategy
  supported by the installed jq and does not construct code for `eval`

### Requirement: jq stream and failure semantics are verified

The skill SHALL explain that a jq filter can produce zero, one, or multiple
results per input and SHALL account for the effects of input modes, array
collection, generators, assignment, optional access, error suppression, raw
output, and exit status. Schema discovery SHALL begin with observable type and
shape checks; optional access and empty-result fallbacks SHALL be added only
when the input contract permits those cases. For large input, the agent SHALL
choose between incremental processing, streaming, and slurping deliberately.

#### Scenario: Filter accidentally changes result cardinality

- **WHEN** iteration, a comma expression, `select`, `empty`, or array collection
  changes the number of outputs
- **THEN** the agent explains and verifies the resulting cardinality rather than
  treating all jq filters as one-input/one-output transformations

#### Scenario: Unknown schema causes a type error

- **WHEN** the source shape has not yet been established
- **THEN** the agent inspects types, keys, and a bounded representative shape
  before adding `?`, `try`, or an empty fallback that could conceal the mismatch

#### Scenario: Large input would be slurped

- **WHEN** aggregation would collect a large stream or document in memory
- **THEN** the agent evaluates incremental reduction, jq streaming, or a
  source-side operation and states any bounded scope

### Requirement: Version claims are evidence-backed and actionable

The skill SHALL identify the official [jq 1.8 manual](https://jqlang.org/manual/v1.8/)
as its current behavioral authority and SHALL retain comparison links to the
official [1.7](https://jqlang.org/manual/v1.7/),
[1.6](https://jqlang.org/manual/v1.6/),
[1.5](https://jqlang.org/manual/v1.5/),
[1.4](https://jqlang.org/manual/v1.4/), and
[1.3](https://jqlang.org/manual/v1.3/) manuals. Version-sensitive guidance SHALL
use objective minimum-version or changed-in-version labels. A capability SHALL
be called "introduced" only when official release evidence, such as the
[jq 1.7 release](https://github.com/jqlang/jq/releases/tag/jq-1.7) or
[jq 1.8.0 release](https://github.com/jqlang/jq/releases/tag/jq-1.8.0), confirms
the claim; manual comparison alone SHALL be described as first-documented
evidence. The agent SHALL inspect the target implementation and build
capabilities when they can change behavior.

#### Scenario: Command uses a recent builtin or option

- **WHEN** a proposed command uses `pick`, `--raw-output0`, `debug(msgs)`, jq 1.8
  trimming filters, `toboolean`, `skip`, `@urid`, or another version-sensitive
  feature
- **THEN** the agent checks or states the required jq version and supplies an
  older-compatible approach when practical

#### Scenario: Manual first documents a capability

- **WHEN** adjacent manuals show a named capability for the first time but
  release evidence does not prove implementation timing
- **THEN** the skill says "first documented in the jq X manual" rather than
  claiming that jq X introduced it

#### Scenario: Behavior depends on the jq build

- **WHEN** exact number-literal preservation, a C math function, date handling,
  or another platform or build-sensitive behavior affects correctness
- **THEN** the agent probes the installed implementation or reports the
  unresolved compatibility constraint instead of relying on the version alone

#### Scenario: Update assignment targets older jq

- **WHEN** an update-assignment right-hand side can emit multiple values
- **THEN** the guidance accounts for jq 1.5 and earlier using the last result and
  jq 1.6 and later manuals specifying the first result
