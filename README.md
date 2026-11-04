# Agent Kit

- [Skills](#skills)
  - [jq](#jq)
    - [Install with skills](#install-with-skills)

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
