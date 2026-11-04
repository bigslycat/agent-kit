---
description: Suggest commit messages with intentional-commits
subagent: false
---

Load `intentional-commits`, or reuse it if already loaded. If it is unavailable,
tell the user, ask how to proceed, and wait for their answer.

Complete the context with any still-missing contents of relevant untracked files
using file-reading tools. Then apply the skill to the request below.

## Request

Suggest commit messages.

$ARGUMENTS

## Repository root

!`git rev-parse --show-toplevel`

## Status

!`git --no-optional-locks status --porcelain=v1 --branch --untracked-files=all`

## Recent repository history (up to 10 commits across refs)

!`git --no-pager log --all -10 --format=fuller --no-color --no-show-signature`

## Staged changes

!`git --no-pager --no-optional-locks diff --cached --no-relative --no-color --no-ext-diff --no-textconv`

## Unstaged changes

!`git --no-pager --no-optional-locks diff --no-relative --no-color --no-ext-diff --no-textconv`

## Untracked files

!`git -c core.quotePath=false ls-files --others --exclude-standard --full-name -- :/`
