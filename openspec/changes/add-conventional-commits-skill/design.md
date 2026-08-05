## Context

The repository already registers `skills` as an OpenCode skill search path, but that directory does not yet exist. The change therefore needs one discoverable skill file and no configuration update. See `proposal.md` for motivation and `specs/conventional-commit-guidance/spec.md` for required behavior.

Conventional Commits 1.0.0 defines message grammar and mandatory semantics for `feat`, `fix`, and breaking changes, but intentionally permits other types and leaves several style choices to projects. The design must keep normative compliance separate from a stricter generation policy so that the skill does not reject messages that the upstream specification accepts.

The user requires instruction-only enforcement. No commit hook, linter configuration, parser, or test script can provide a mechanical boundary, so the strongest available control is a blocking decision process with explicit completion criteria.

## Goals / Non-Goals

**Goals:**

- Make type and breaking-change classification happen before message composition.
- Keep the complete process and the pinned 1.0.0 rules in one `SKILL.md` so every invocation receives the required context.
- Make ambiguous or mixed changes stop for clarification or splitting instead of being silently classified.
- Make generated messages follow a conservative, unambiguous subset of the specification while validating all messages against the full specification.
- Keep normative rules, local conventions, and generation preferences visibly distinct.

**Non-Goals:**

- Add Git hooks, commitlint, release tooling, shell commands, or executable validation.
- Define repository-specific release behavior beyond the SemVer correlations stated by Conventional Commits 1.0.0.
- Guarantee that commits created outside an agent invocation conform to the specification.
- Replace project-specific type or scope policies when they are documented and compatible with Conventional Commits.

## Decisions

### Use one model-invoked, self-contained skill

Create only `skills/conventional-commits/SKILL.md`. Its frontmatter name will match the directory, and its description will front-load Conventional Commit terminology and cover the distinct triggers: choosing a type or scope, assessing breaking compatibility, writing or reviewing a message, and creating a commit.

Keeping the normative reference and procedure in the same file avoids a context pointer that the agent might not follow. The body will cite the pinned Conventional Commits 1.0.0 specification as its authority and will not depend on a live network fetch.

Alternatives considered:

- A user-invoked skill would reduce context load but would not reliably apply to ordinary commit requests.
- Separate reference files would shorten the entry point but conflict with the instruction-only single-file constraint and introduce a missed-reference failure mode.
- Fetching the specification on each use would add latency and availability risk to a versioned, stable rule set.

### Organize the instructions as a gated decision pipeline

The skill will require this sequence:

```text
available evidence
       |
       v
single atomic intent? ---- no ----> split or clarify
       |
      yes
       v
select base type (feat/fix precedence)
       |
       v
compare public contract before/after
       |
       v
render header, body, and footers
       |
       v
audit every normative 1.0.0 rule
       |
       v
present, approve, or use message
```

Each gate will have an observable completion criterion. The final message cannot be presented or used while evidence is missing, multiple independent mandatory types remain, breaking status is unresolved, or any normative check fails.

Alternatives considered:

- A message template alone checks shape but cannot prevent a syntactically valid `chore` from hiding a feature or breaking change.
- Selecting a type from changed paths is easy to automate mentally but misclassifies documentation in source files, generated files, dependency changes with runtime impact, and similar cases.

### Separate base type from compatibility classification

The instructions will first determine the atomic intent:

- `feat` for a new application or library feature.
- `fix` for correction of an application or library defect.
- A documented project type for other intents, or a compact default taxonomy covering documentation, tests, behavior-preserving refactoring, performance, build, CI, non-semantic style, maintenance, and reverts.

Only after the base type is known will the skill determine whether the public contract is backward-incompatible. This preserves correct combinations such as `fix!` and `build!` instead of treating every breaking change as a feature. `chore` will be a last-resort maintenance classification, not a default for uncertainty.

The compatibility check will explicitly include source APIs, exported types, command-line interfaces, configuration and environment variables, wire and persisted formats, protocols and events, documented defaults and behavior, and supported runtimes or platforms. It will focus on whether an existing consumer must migrate, not on the current package version or the size of the code diff.

Alternatives considered:

- Choosing breaking status first encourages the incorrect assumption that all major changes are `feat`.
- Limiting public API to exported source symbols misses common breaking changes in CLI, configuration, data, and platform support.

### Generate both breaking indicators while validating either valid form

For newly generated breaking messages, the skill will require both:

- `!` immediately before the header colon for visibility.
- A canonical uppercase `BREAKING CHANGE: ` footer explaining affected consumers and migration.

This is a valid strict subset of Conventional Commits 1.0.0 and makes both the release signal and migration impact explicit. During validation, however, the skill will accept the specification's other valid forms: `!` alone when the description communicates the break, a canonical footer alone, and the synonymous `BREAKING-CHANGE` footer token.

Alternatives considered:

- Requiring only `!` is compact but can omit actionable migration context.
- Requiring only the footer is valid but makes the breaking signal less visible in the subject line.
- Calling one-form existing messages invalid would confuse generation policy with the upstream specification.

### Embed an exhaustive normative audit

The final section of the skill will map all 16 numbered specification rules into a checkable audit. It will cover semantics as well as syntax: mandatory `feat` and `fix` selection, optional scope form, description placement, blank-line boundaries, free-form body, footer grammar and continuation, both breaking representations, reserved casing, `!` placement, additional types, case handling, and `BREAKING-CHANGE` equivalence.

The audit will distinguish three layers:

1. Conventional Commits 1.0.0 requirements, which determine compliance.
2. Repository policy, which can narrow valid choices without redefining the upstream specification.
3. Skill generation preferences, such as lowercase output and redundant breaking notation.

This prevents common style conventions such as imperative mood, subject line length, or terminal punctuation from being falsely labeled as specification requirements.

Alternatives considered:

- Referring only to the external URL is concise but does not ensure every rule is considered during each run.
- A regex-oriented checklist would miss semantic errors such as selecting `fix` for a feature or failing to recognize a compatibility break.

## Risks / Trade-offs

- [Instruction-only enforcement cannot mathematically guarantee every agent output] -> Make every stage blocking, require explicit clarification for unresolved semantics, and require an exhaustive final audit before use; state that external commits remain out of scope.
- [Model invocation is probabilistic] -> Use a model-invoked skill with concrete trigger phrases covering commit creation, message review, type/scope choice, and breaking-change assessment.
- [The full normative audit increases skill length and context load] -> Co-locate each rule once, use a compact decision table and checklist, and avoid duplicating examples or prose.
- [Requiring both breaking indicators is stricter than the specification] -> Label it as generation policy and accept every form permitted by 1.0.0 during validation.
- [Project-specific conventions can conflict with the default taxonomy] -> Read documented local policy first, preserve the mandatory upstream semantics, and ask when both cannot be satisfied.
- [Breaking status depends on domain knowledge that a diff may not expose] -> Treat unknown consumer contracts as a clarification gate rather than guessing.

## Migration Plan

1. Add the single skill file under the already configured `skills` search path.
2. Review the file against the capability scenarios and all 16 normative rules.
3. Run the repository's existing formatting and lint checks; add no new validation tooling.
4. Restart OpenCode so its configuration-time skill discovery reloads the new file.

Rollback consists of removing the skill directory; no persisted data, dependency, or configuration migration is involved.
