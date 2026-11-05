# Agent Kit

- [Skills](#skills)
  - [jq](#jq)
  - [Intentional Commits](#intentional-commits)
- [OpenCode](#opencode)
  - [Commands](#commands)
    - [/commit-message](#commit-message)
    - [/commit](#commit)
    - [/amend](#amend)

## Skills

### jq

A skill for writing, reviewing, and debugging jq filters. It helps agents
extract relevant JSON before it enters their context, preserve source data, and
handle shell quoting and version compatibility. See the
[full guide](skills/jq/SKILL.md).

#### Install with [skills](https://github.com/vercel-labs/skills)

Project:

```sh
npx -y skills add bigslycat/agent-kit --skill jq
```

Global:

```sh
npx -y skills add -g bigslycat/agent-kit --skill jq
```

### Intentional Commits

A skill for preparing commit messages, planning commit series, and creating or
updating Git commits. It groups changes by independent goals, follows repository
conventions, and verifies each commit's contents and message against the
intended changes. See the [full workflow](skills/intentional-commits/SKILL.md).

#### Install with [skills](https://github.com/vercel-labs/skills)

Project:

```sh
npx -y skills add bigslycat/agent-kit --skill intentional-commits
```

Global:

```sh
npx -y skills add -g bigslycat/agent-kit --skill intentional-commits
```

## OpenCode

### Commands

[Slash commands](https://opencode.ai/v2/docs/commands) for OpenCode. Copy the
Markdown files from [`.opencode/commands/`](.opencode/commands/) into one of
these locations:

- `.opencode/commands/` in the target project for project-local commands.
- `~/.config/opencode/commands/` for global commands.

#### /commit-message

[`/commit-message`](.opencode/commands/commit-message.md) suggests one or more
commit messages. By default, it uses staged changes when present; otherwise, it
uses unstaged and untracked changes. It leaves the working tree, index, and
history untouched and skips project checks.

```text
/commit-message
```

Requires [Intentional Commits](#intentional-commits).

#### /commit

[`/commit`](.opencode/commands/commit.md) creates commits grouped by independent
goals. By default, it includes all current changes.

```text
/commit README.md only
```

Requires [Intentional Commits](#intentional-commits).

#### /amend

[`/amend`](.opencode/commands/amend.md) updates `HEAD` as exactly one commit and
revises its message to describe the complete amended commit. By default, it
incorporates all current changes. A message-only request preserves the commit's
contents and the index.

```text
/amend update the message only
```

Requires [Intentional Commits](#intentional-commits).
