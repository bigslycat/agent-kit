---
name: jq
description: jq guidance for writing, running, explaining, reviewing, or debugging jq; querying persistent JSON; reducing accessible JSON from commands, APIs, or materialized tool results; and checking compatibility. Explicit jq requests qualify without runnable input; otherwise use it only at a meaningful JSON boundary.
license: MIT
---

# jq

Treat jq output as an evidence view, not as the source. For writing, explanation,
review, or debugging without runnable input, apply the relevant semantic, shell,
and version checks and state unverified assumptions; source reachability gates
execution, not invocation.

**Required version context:** Read
[`references/version-compatibility.md`](references/version-compatibility.md)
before using a version-sensitive option, builtin, operator, syntax, or behavior;
targeting jq older than 1.8 or an unknown/vendor implementation; answering a
history question; or relying on build/platform behavior. Check the target when
execution is allowed. The current authority is the official
[jq 1.8 manual](https://jqlang.org/manual/v1.8/).

## 1. Establish The Boundary

Use jq to select, project, normalize, aggregate, validate, redact, compare, or
prepare typed/delimited output when it reduces accessible JSON before irrelevant
data enters context.

| Source                                                                           | Treatment                                                             |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Persistent jq-compatible file                                                    | Query read-only; revise views against the same evidence.              |
| Cheap, side-effect-free, sufficiently repeatable producer                        | Pipe directly only after the replay gate.                             |
| Stateful, unique, expensive, rate-limited, time-sensitive, or uncertain producer | Capture complete stdout and producer status before jq.                |
| Tool result with a native selector                                               | Prefer the selector when it preserves the required evidence.          |
| Tool result with an approved full-output path or handle                          | Query that materialized result without replay.                        |
| Result visible only in context                                                   | Reason directly or use native tool facilities; it is not shell stdin. |
| Specialized/source-side query, or small visible JSON                             | Prefer the narrower operation; jq adds no useful boundary.            |
| JSONC, JSON5, YAML, XML, or another format                                       | Use a format-aware parser or explicit conversion.                     |

Follow higher-priority tool/runtime instructions. Before execution, identify the
actual bytes, file, handle, selector, or safe replay path. Read-only does not
imply repeatable: status, random samples, log tails, and changing resources can
be unique observations.

**Continue when:** the request can be handled statically, or execution has a
useful jq role and a concrete source path.

## 2. Protect Ephemeral Evidence

Allow `producer | jq ...` only when all six facts are established:

1. No unwanted producer side effects.
2. The observation can be recreated well enough for the decision.
3. Replay is acceptably cheap and does not consume a problematic quota.
4. The JSON shape is known.
5. The filter is preflighted for syntax, shape, and 0/1/N cardinality.
6. Producer and jq failures are independently observable.

If stage statuses are unavailable, capture first. Bash exposes `PIPESTATUS` and
Zsh `pipestatus`; `pipefail` alone does not identify the failed stage. Other
shells and execution tools require their documented mechanism.

When any fact is unresolved:

1. Prefer a tool-managed full-output path/handle; otherwise use approved secure
   temporary storage outside the repository when possible.
2. Run the producer once, writing complete stdout to the snapshot, stderr
   separately, and recording producer status.
3. Verify capture completeness and jq compatibility. Producer failure still
   matters when stdout parses.
4. Query only the snapshot. Retain it until shape, identifiers, counts, scope,
   producer status, and jq status are validated; then release it promptly.

Never replay a valuable producer merely to repair a filter. Keep sensitive or
large raw output out of context. A live `tee` pipeline is not capture-first: an
early downstream exit, closed pipe, partial write, disk failure, or hidden stage
status can leave an incomplete snapshot. Use it only when loss is acceptable.

**Continue when:** direct replay is proven safe, or complete raw output and
producer status exist independently of jq.

## 3. Define The View

Discover shape strictly before final paths. Start with bounded type, count, and
key inspection; omit keys when names may be sensitive:

```sh
jq 'type' data.json
jq 'if type == "object" then {key_count: (keys|length), keys: keys[:20]}
    elif type == "array" then length as $n |
      {count:$n, inspected_count:(if $n<20 then $n else 20 end),
       inspected_types:([.[:20][]|type]|unique), inspection_truncated:($n>20)}
    else {kind: type} end' data.json
```

These probes run once per top-level JSON value and disclose bounded sampling;
validate full heterogeneity separately when the contract requires it.

Delay `?`, `try`, `// empty`, and similar suppression until missing/variant data
is part of the established contract. `has("x")` distinguishes a missing key from
present `null`; `//` treats `false` and `null` as fallback values; `empty` emits
no value. Treat an unexpected type error as evidence, not noise.

Define the result before filtering:

```text
source shape + records + retained fields + 0/1/N cardinality
             + encoding + completeness scope + consumer
```

Retain IDs, names, filenames, source/match counts, or equivalent provenance.
Disclose pagination, limits, sampling, streaming windows, and tool truncation.
Fetch every required page before claiming a global total; otherwise label the
view partial. For empty output, check producer/parse status, shape, path,
predicate, optionality, scope, and expected cardinality before claiming no
matches.

**Continue when:** the view can support and challenge the intended decision.

## 4. Query Files Without Destroying Them

After validating one-document-per-file assumptions, use read-only views such as:

- Package manifest: `jq '{name,version}' package.json`
- API schema: `jq '.paths | keys' openapi.json`
- Test/coverage report:
  `jq '{total:(.tests|length),failed:[.tests[]|select(.status=="failed")|{id,file}]}' report.json`
- Bundle statistics:
  `jq 'reduce .assets[] as $a ({count:0,bytes:0}; ($a.size|if type=="number" then . else error("invalid size") end) as $n|.count+=1|.bytes+=$n)' stats.json`
- SBOM: `jq '[.components[]|{name,version,supplier}]' bom.json`
- Exported configuration: `jq 'del(.credentials,.tokens)' export.json` after
  verifying every secret path
- Multiple files: `jq '{file:input_filename,name,version}' a.json b.json`
- NDJSON: `jq -c 'select(.level=="error")|{id,message}' events.ndjson`

For JSON streams, every example can emit 0/N results per file; include that
top-level cardinality in the result contract.

`del` is not recursive secret discovery. `input_filename` also assumes a UTF-8
locale; otherwise preserve provenance another way.

Reject `jq FILTER source.json > source.json`: shell redirection can truncate the
source before jq reads it. For an explicitly requested transformation, keep the
original, write a separate candidate, check statuses/nonempty expectations,
parse and assert its intended shape/cardinality, then use the
environment-appropriate replacement mechanism. Generated manifests and
lockfiles remain owned by their generators.

jq reads a stream of whitespace-separated JSON values, so parsing success does
not prove one strict RFC JSON document. NDJSON works when each record is JSON;
JSONC/JSON5 comments and trailing commas do not. Reference jq 1.8.0 also accepts
plain `NaN` and `Infinity`. Use a format-aware strict validator when strict
single-document conformance matters, and probe older/vendor extensions.

**Continue when:** the source remains intact and any candidate is separately
parsed and shape-checked.

## 5. Preserve Shell And Data Boundaries

| Shell                 | jq program quoting                                                  |
| --------------------- | ------------------------------------------------------------------- |
| POSIX `sh`, Bash, Zsh | Single quotes; pass shell values separately.                        |
| PowerShell            | Single quotes; write jq string quotes as `\"` for native arguments. |
| `cmd.exe`             | Double quotes; write jq string quotes as `\"`.                      |

No command string is portable across all three. Keep external values out of jq
source: use `--arg` for strings, `--argjson` for parsed JSON, `--rawfile` for
file text, `--slurpfile` for a parsed JSON stream, `--args`/`--jsonargs` for
positionals, and `-f` for a maintained trusted filter. Never use shell word
splitting or `eval`, and do not expose secrets merely to construct a query.

For arbitrary strings, newline-delimited `-r` is unsafe. Keep JSON for JSON
consumers, or use `--raw-output0` only when jq and the consumer support NUL,
values cannot contain NUL, and option-like values are passed after `--` or via a
non-option API. Materialize and validate output before a side-effecting consumer
when partial application would matter.

**Continue when:** code, values, delimiters, and the consumer have explicit,
shell-correct contracts.

## 6. Track jq Semantics And Resources

Every filter produces zero, one, or many results per input:

- Comma runs branches on the same input; pipe sends each left output right.
- `.[]` iterates; `[.[]]` collects. `select` may drop input; `empty` always does.
- `a // b` uses `b` when `a` emits no non-`false`/non-`null` value; otherwise
  those values pass. Preserve legitimate `false` with explicit tests.
- `?` and `try` suppress errors/outputs; use them only for established variants.
- `reduce`/`foreach` can aggregate without collecting the full stream.
- `path = rhs` evaluates RHS against the assignment input and emits a root per
  RHS result. `path |= rhs` receives the old path value. For multi-output `|=`,
  jq 1.5 uses the last result and jq 1.6+ the first; empty-RHS deletion is
  documented from 1.6. Prefer one RHS result and explicit `del(path)`.

| Mode                        | Contract                                                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Default, `-n`, `-R`, `-s`   | JSON stream; one null input; raw lines; or full-stream collection. Avoid slurping large/unbounded input.                      |
| `--stream`                  | Path/value representation, requiring a stream-aware filter.                                                                   |
| `--stream-errors`, `--seq`  | Parse failures become values, or malformed sequence input is skipped with warnings; detect/disclose partial recovery.         |
| `-c`, `-r`, `--raw-output0` | Compact JSON, raw text, or version-gated NUL records. Match consumer boundaries.                                              |
| `-S`, `sort`, `sort_by`     | Deterministic object keys or arrays; sort only when order is irrelevant.                                                      |
| `--unbuffered`, `-e`        | Flush each output, or derive status from the last output; no output has a distinct status (4 in jq 1.7+). Verify every stage. |

Prefer source-side filtering and incremental reduction. `--stream` is not a
transparent low-memory switch. Probe exact decimal behavior, C math, and dates
when correctness depends on build/platform details; otherwise report the
constraint unresolved. Treat modules as executable code and raw snapshots,
stderr, `debug`, and `stderr` output as possible secret channels.

## Final Gate

Before relying on a result, verify all of these:

1. jq received permitted, actual bytes and the replay decision was correct.
2. Valuable raw evidence and producer status remain recoverable.
3. Producer, parse, compile/runtime, and jq statuses meet the contract.
4. Shape and 0/1/N cardinality match expectations; missing/null/false/empty/error
   remain distinct.
5. IDs, counts, filenames, and completeness scope make the view traceable.
6. Encoding, delimiters, ordering, and the next consumer agree.
7. The original is intact; sensitive/temporary data follows retention policy.
8. Version/build/platform behavior is verified or explicitly unresolved.

If a check fails, correct the view against preserved evidence. Never repair a jq
mistake by replaying a producer that failed the replay gate.
