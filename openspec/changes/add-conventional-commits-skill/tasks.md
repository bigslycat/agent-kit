## 1. Skill Package

- [x] 1.1 Create `skills/conventional-commits/SKILL.md` as the only file in the skill package.
- [x] 1.2 Add valid model-invoked skill frontmatter whose name matches the directory and whose description covers type, scope, breaking-change, message-writing, review, and commit-creation triggers.
- [x] 1.3 Cite in `SKILL.md` the official version-pinned Conventional Commits 1.0.0 source required by `specs/conventional-commit-guidance/spec.md`, identify it as normative, and add no live-fetch requirement, script, hook, executable, dependency, or auxiliary reference file.

## 2. Decision And Validation Instructions

- [x] 2.1 Add an evidence and atomicity gate that classifies the complete change by intent, requests missing contract context, and splits independent `feat` and `fix` intents before message construction.
- [x] 2.2 Add the base-type decision rules with mandatory `feat` and `fix` precedence, repository-policy precedence for compatible extra types, and precise fallback meanings for `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `style`, `chore`, and `revert`.
- [x] 2.3 Add an independent compatibility assessment covering code APIs, CLI, configuration, environment, protocols, events, data formats, documented behavior and defaults, and runtime or platform support, including pre-1.0 and breaking-fix cases.
- [x] 2.4 Add message-construction instructions for header, optional scope, description, body, and footers, requiring both `!` and a migration-focused `BREAKING CHANGE: ` footer for newly generated breaking messages.
- [x] 2.5 Add a blocking audit that explicitly accounts for all 16 normative Conventional Commits 1.0.0 rules and prevents presentation, approval, or commit use until every applicable check passes.
- [x] 2.6 Separate upstream compliance, repository policy, and generation preferences so validation accepts `!`-only, footer-only, and `BREAKING-CHANGE` forms allowed by the specification without presenting optional style as normative.

## 3. Verification

- [x] 3.1 Review the skill against every requirement and scenario in `specs/conventional-commit-guidance/spec.md`, including ambiguous, mixed-intent, non-breaking additive, internal-only, and breaking migration cases.
- [x] 3.2 Exercise the instructions manually with representative `feat`, `fix`, additional-type, scoped, body-and-footer, invalid-casing, malformed-footer, `!`-only, footer-only, and breaking non-feature messages; confirm classification and validation match version 1.0.0.
- [x] 3.3 Verify `skills/conventional-commits/` contains only `SKILL.md`, the skill is discoverable through the existing `skills` search path, and no project configuration or dependency change was introduced.
- [x] 3.4 Run the repository's existing formatting and lint checks and resolve any failures caused by the new skill file.
- [x] 3.5 Report that OpenCode must be restarted to load the newly added configuration-time skill.
