# Agent Kit

- [Skills](#skills)
  - [jq](#jq)
    - [Install with skills](#install-with-skills)
  - [Intentional Commits](#intentional-commits)
    - [Install with skills](#install-with-skills-1)

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
