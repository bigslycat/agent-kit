# Agent Kit

## Content boundaries

- Skills live in `skills/<id>/SKILL.md`, with supporting references beside them.
  `opencode.jsonc` explicitly loads `skills/`; edit these distributable sources.
  The private root package provides development tooling for the Markdown
  content.
- The `/commit`, `/amend`, and `/commit-message` templates in
  `.opencode/commands/` delegate to `skills/intentional-commits/SKILL.md`. Keep
  the shared commit workflow in that skill; templates supply the request,
  `$ARGUMENTS`, and Git context through executable `!`-backtick blocks. Preserve
  their `subagent: false` setting. Command behavior is documented in
  `README.md`.

## Tooling and checks

- Use Yarn, as selected by `packageManager` and `yarn.lock`; Node and Yarn
  versions are pinned in `.prototools`. The `npm run` calls inside scripts do
  not make this an npm-managed project.
- `yarn check` runs formatting checks, then lint, **without typechecking**. For
  TypeScript configuration changes, also run `yarn typecheck` (`tsc`, no emit).
  There is no build or test suite configured.
- For Markdown-only edits, use `yarn fmt:check <changed-paths>`; for this file,
  `yarn fmt:check AGENTS.md`. To format selected files, use
  `yarn fmt <changed-paths>`; bare `yarn fmt` and `yarn fix` act
  repository-wide.
- Oxfmt handles Markdown as well as code. `oxfmt.config.ts` enables prose
  wrapping and embedded-language formatting, so formatting can also change
  fenced examples.
