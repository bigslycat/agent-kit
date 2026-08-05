## 1. Documentation Evidence Gate

- [ ] 1.1 Re-open the official jq manuals for
      [1.8](https://jqlang.org/manual/v1.8/),
      [1.7](https://jqlang.org/manual/v1.7/),
      [1.6](https://jqlang.org/manual/v1.6/),
      [1.5](https://jqlang.org/manual/v1.5/),
      [1.4](https://jqlang.org/manual/v1.4/), and
      [1.3](https://jqlang.org/manual/v1.3/) before writing the skill, and record an
      adjacent-version evidence matrix for every version-sensitive behavior the
      skill will mention.
- [ ] 1.2 Re-open the official
      [jq 1.7 release notes](https://github.com/jqlang/jq/releases/tag/jq-1.7) and
      [jq 1.8.0 release notes](https://github.com/jqlang/jq/releases/tag/jq-1.8.0),
      and reserve "introduced" for additions those sources explicitly confirm.
- [ ] 1.3 Classify every retained claim as documented, first documented,
      changed, introduced, removed, or runtime-probe-dependent; resolve or remove
      any claim whose evidence does not support its wording.
- [ ] 1.4 Account explicitly for the jq 1.5-to-1.6 update-assignment change,
      jq 1.7 additions and behavior changes, jq 1.8 additions and breaking
      semantics, manual-only deltas such as `--stream-errors`, and build-sensitive
      number handling.
- [ ] 1.5 Plan original examples and paraphrased explanations, retain source
      attribution, and avoid copying the CC BY 3.0 manual prose or example corpus
      into the MIT-licensed skill.

## 2. Skill Package

- [ ] 2.1 Create `skills/jq/SKILL.md` with valid model-invoked frontmatter whose
      name matches the directory and whose description covers jq creation,
      execution, explanation, review, debugging, accessible JSON reduction, file
      analysis, and version compatibility without triggering on every small JSON
      result.
- [ ] 2.2 Create `skills/jq/references/version-compatibility.md` as the only
      progressively disclosed reference, containing all official source links,
      objective version labels, high-risk deltas, runtime-probe notes, and practical
      older-version fallbacks.
- [ ] 2.3 Add a precise context pointer in `SKILL.md` that requires the version
      reference before using a version-sensitive feature, targeting older jq, or
      answering version-history questions.
- [ ] 2.4 Keep the package instruction-only: add no executable, install step,
      dependency, generated snapshot, configuration change, or copied manual.

## 3. Agent JSON Boundary Workflow

- [ ] 3.1 Add a practical use and non-use map covering persistent JSON files,
      JSON-emitting commands and APIs, materialized tool outputs, context-only tool
      results, specialized tools, native selectors, non-JSON formats, JSONC, and
      small already-visible data.
- [ ] 3.2 Add source classification for persistent files, sufficiently
      repeatable producers, valuable or non-repeatable producers, and tool-managed
      results; require the actual byte, path, handle, selector, or safe replay path
      to be known before jq is chosen.
- [ ] 3.3 Add the blocking replay gate for direct pipelines, covering side
      effects, observation repeatability, cost or rate limits, known schema,
      preflighted filter cardinality, and independently observable producer and jq
      failures.
- [ ] 3.4 Add capture-first guidance for every unresolved replay condition:
      complete stdout, separate stderr, producer status, raw evidence retained until
      validation, secure temporary handling, and no stateful replay merely to fix a
      filter.
- [ ] 3.5 Explain why a live `tee` pipeline is not a guaranteed snapshot for
      irreplaceable output, including early downstream exit, closed pipes, partial
      writes, disk failure, and hidden pipeline statuses.
- [ ] 3.6 Add a decision-complete result contract covering source shape,
      desired records and fields, zero/one/many cardinality, output encoding,
      identifiers, source and match counts, pagination, source limits, sampling,
      streaming windows, tool truncation, and the next consumer.
- [ ] 3.7 Add strict-first schema discovery and empty-result diagnosis; delay
      `?`, `try`, `// empty`, and similar suppression until missing or variant data
      is part of the established input contract.

## 4. jq Files, Filters, And Invocation Safety

- [ ] 4.1 Add non-destructive JSON-file guidance with examples for package
      manifests, API schemas, reports, statistics, SBOMs, exported configuration,
      multiple files, and NDJSON; preserve filenames or other provenance where
      relevant.
- [ ] 4.2 Block same-path input/output redirection and require an explicitly
      requested transformation to produce and validate a separate candidate before
      any environment-appropriate replacement.
- [ ] 4.3 Distinguish jq-compatible input from JSONC, JSON5, multiple top-level
      JSON values, and strict RFC validation; do not use jq parsing success alone as
      a strict-validity claim.
- [ ] 4.4 Add shell-specific quoting guidance and safe value transport through
      `--arg`, `--argjson`, `--rawfile`, `--slurpfile`, positional arguments, and
      filter files; prohibit jq-source interpolation of external data, accidental
      word splitting, and generated-shell `eval`.
- [ ] 4.5 Add input and output mode guidance for JSON streams, null input, raw
      input, slurp, streaming, compact JSON, raw text, delimiters, sorting,
      unbuffered output, and exit status, with version gates where required.
- [ ] 4.6 Explain jq's generator and assignment model, including zero/one/many
      results, comma versus pipe, iteration versus collection, `select`, `empty`,
      `//`, optional access, errors, reductions, `=` versus `|=`, and the verified
      cross-version assignment differences.
- [ ] 4.7 Add large-input and platform guidance covering incremental reduction,
      `--stream`, accidental slurping, build-sensitive decimal behavior, C math and
      date portability, module trust boundaries, and sensitive stderr or debug
      output.

## 5. Verification

- [ ] 5.1 Review `SKILL.md` and the compatibility reference against every
      requirement and scenario in `specs/agent-jq-guidance/spec.md`, with no
      requirement satisfied only by an unstated assumption.
- [ ] 5.2 Exercise persistent-file scenarios for a valid JSON artifact, NDJSON,
      multiple files, JSONC rejection, strict-validation limits, same-file
      redirection rejection, and a separately validated transformation candidate.
- [ ] 5.3 Exercise producer scenarios for a cheap repeatable source, an
      expensive or rate-limited source, a mutating or time-sensitive response, a
      failed producer, a failed jq filter, an early-closing downstream, and a raw
      snapshot that remains recoverable.
- [ ] 5.4 Exercise tool-result scenarios for a native selector, a permitted
      full-output path or handle, a truncated result with a supported retrieval
      mechanism, and a context-only result that jq cannot consume.
- [ ] 5.5 Exercise correctness scenarios for unknown shape, missing versus null
      or false, empty selection, multiple outputs, incomplete pagination, bounded
      sampling, raw arbitrary strings, shell-specific quoting, and external value
      injection.
- [ ] 5.6 Validate stable and jq 1.7 behavior against the installed
      `jq-1.7.1-apple`; validate every jq 1.8-specific example and claimed changed
      behavior against an isolated jq 1.8 runtime when available, recording any
      vendor, platform, or build differences.
- [ ] 5.7 Repeat the documentation audit after the skill is written and verify
      that every version label, fallback, option name, builtin signature, semantic
      claim, and manual or release link still matches its cited source.
- [ ] 5.8 Verify `skills/jq/` contains only `SKILL.md` and the planned Markdown
      reference, remains discoverable through the existing `skills` path, and adds
      no configuration, executable, dependency, or transient data.
- [ ] 5.9 Run `yarn check` and resolve every formatting or lint failure caused
      by the new skill package or change artifacts.
- [ ] 5.10 Report that OpenCode must be restarted before the newly created skill
      can be discovered by a running session.
