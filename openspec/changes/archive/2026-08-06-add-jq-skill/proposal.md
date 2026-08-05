## Why

Agents routinely encounter large or deeply nested JSON in command output, tool
results, and repository files. Without dedicated guidance they can flood their
context with irrelevant data, apply jq where the source is not actually
accessible, lose an irreplaceable command result behind an incorrect filter, or
produce commands whose quoting and behavior do not match the installed jq
version.

## What Changes

- Add a model-invoked jq skill focused on practical agent use: inspecting JSON
  files and extracting, normalizing, aggregating, validating, or redacting JSON
  from commands and accessible tool results.
- Teach the agent to classify the JSON source before choosing jq, prefer a
  specialized tool or source-side query when it is safer, and never assume that
  an in-context tool result can be piped into a shell process.
- Add a replay gate for ephemeral output. Cheap, read-only, repeatable sources
  with known schemas may be piped directly; valuable, stateful, expensive,
  rate-limited, or uncertain output must be preserved before jq is applied.
- Treat jq output as a view over source evidence. Require identifiers,
  cardinality, pagination or truncation scope, producer status, and jq status to
  remain sufficient for the agent's decision.
- Cover safe shell quoting, external-value transport, input and output modes,
  generator cardinality, error handling, large-input behavior, and read-only
  JSON-file analysis. Explicitly prevent same-file redirection and silent error
  suppression during schema discovery.
- Ground the current behavior in the official [jq 1.8 manual](https://jqlang.org/manual/v1.8/)
  and compare it with the official [1.7](https://jqlang.org/manual/v1.7/),
  [1.6](https://jqlang.org/manual/v1.6/),
  [1.5](https://jqlang.org/manual/v1.5/),
  [1.4](https://jqlang.org/manual/v1.4/), and
  [1.3](https://jqlang.org/manual/v1.3/) manuals.
- Mark version-sensitive behavior with objective jq version labels. Use
  "introduced" only when official release evidence confirms it; otherwise say
  that a capability is first documented in a particular manual.
- Keep the skill instruction-only, with no jq installation, executable scripts,
  runtime dependencies, or configuration changes.

## Capabilities

### New Capabilities

- `agent-jq-guidance`: Decide when and how an agent should use jq, construct and
  verify safe filters and invocations, preserve valuable JSON evidence, inspect
  JSON files, and account for jq version compatibility.

### Modified Capabilities

- None.

## Impact

- Adds `skills/jq/SKILL.md` and a progressively disclosed jq version reference
  under `skills/jq/references/`.
- Affects agent behavior when handling accessible JSON from files, commands,
  APIs, or tool-managed outputs; it does not change application APIs or runtime
  behavior.
- Uses the repository's existing `skills` search path, so no `opencode.jsonc`
  update or package dependency is required.
- The skill will cite and paraphrase the jq documentation rather than mirror it;
  original examples will avoid importing documentation prose into this MIT
  repository.
