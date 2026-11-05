---
name: intentional-commits
description: >-
  Prepare and create Git commits with intentional change selection. Use when the
  user asks to suggest a commit message, create commits, plan a commit series,
  split changes into commits, or modify an existing commit.
license: MIT
---

# Intentional Commits

Use all relevant information already available in the request, conversation, and
earlier results throughout the workflow. Before each read or query, identify the
material gap, inconsistency, or concrete change that requires it; retrieve only
what is needed to resolve it. A different command, tool, or output format does
not justify fetching the same facts again.

Instructions to inspect, verify, or compare require evaluating evidence, not
automatically making tool calls. After an operation changes state, use its
results or targeted queries for the affected facts; retain evidence that still
applies.

Run operations in parallel when they have no dependencies on each other's
results and no shared-state conflicts. Batch sequential operations into one call
when their order and error handling are known in advance and intermediate
results require no semantic judgment.

Prefer the agent's native batching mechanisms; combine suitable CLI commands
into a single shell invocation when that is simpler. Wait for every started
operation and retain each result and status; stop dependent actions on failure.

## 1. Determine the requested outcome

Determine the expected outcome from the request and context:

- A message or a plan for commit contents and order: prepare it while preserving
  the index and history.
- Creating commits: proceed without asking for confirmation again.
- Changing the specified commit's message: preserve the changes it contains.

Modifying existing commits and publishing commits must be within the request's
scope. A request to edit code does not by itself include committing it.

By default, split the selected changes by independent goals supported by the
diff and task context. Keep changes serving one goal, including implementation,
tests, and documentation, in one commit. "Make a commit" does not set the commit
count; an explicit "exactly one commit" does.

Respect the specified boundaries: the task and changes, repository, branch or
commit, commit count, and permitted actions. Resolve uncertainties first from
context and available repository data. Ask the user only about unresolved
ambiguities that affect the outcome, before taking the affected action.

**Done when:** the outcome and explicit constraints are clear. Determine the
exact commit contents and count after examining the diff, within those
constraints.

## 2. Account for settings and conventions

Use settings and conventions already known from the current context. Consult
additional sources only when a material gap or conflict prevents fulfilling the
request.

Follow the established language and message format. Explicit requirements take
precedence over examples from history.

**Done when:** known applicable requirements are accounted for and identified
material gaps and conflicts are resolved.

## 3. Inspect current changes

Confirm the selected repository and branch from the available evidence. Analyze
the available diffs and relevant untracked file contents to understand the
changes and how they relate to the request.

Distinguish staged and unstaged changes, including partially staged files. One
file may contain changes for different tasks. Preserve the working tree and
index during analysis.

**Done when:** the meaning of the changes, their relation to the request, and
the index contents are clear.

## 4. Choose commit contents and order

Define each commit's goal and exact contents, down to individual changes within
a file.

Identify dependencies from the diff and context. Include prerequisite changes in
an earlier commit or in the same commit.

**Done when:** all requested changes are assigned to commits, with a known goal,
contents, and position in the sequence for each.

If only a plan was requested, present it and stop.

To propose a message or change only an existing commit's message, go to step 6
without changing the index or running separate checks.

## 5. Prepare and verify the snapshot

Reuse applicable check results for the requested set of changes. Run any
outstanding required or otherwise necessary checks before starting the commit
series. Between commits, inspect only diffs and Git state; do not run project
checks separately. Standard Git hooks run according to their configuration.

Stage the selected changes while preserving all other edits and their original
staging state. Compare the entire staged diff with the intended contents of the
current commit.

If new edits are made after the checks, pause the series, recheck the updated
selection, and rerun only the checks affected by those edits. Staging and
creating commits do not themselves require reruns.

**Done when:** the snapshot matches the selected contents, necessary checks for
the requested set of changes have passed, and blocking issues are resolved.

## 6. Write the commit message

Base the message on the final diff of the specific commit and confirmed context.
When changing only a message, use the specified commit's diff, not current local
changes.

Summarize the change in the subject; use the body when needed to explain the
reason and material consequences. State breaking changes and required migration
explicitly. Choose type and scope, when needed, based on what the change does.
Take links and issue details from confirmed context.

**Done when:** the message matches the diff and applicable conventions, and
every claim is supported by the changes or known context.

If the request is only to suggest a message, return it and stop.

## 7. Create commits and verify the result

Perform the selected operation with the prepared message. When changing only a
message, preserve the specified commit's tree and the original index.

On failure, first determine whether the commit was created and what the command
or hooks changed. Retry creation only if no commit was created; after new edits,
update the snapshot and message following steps 5–6.

After success, obtain the SHA and compare the actual message and diff with the
intended ones. Compare the remaining working-tree changes and index with the
expected state. If they differ, stop the series and determine why.

Continue the series in the selected order, preparing a snapshot and message for
each subsequent commit. Publish the commits if requested, after verifying the
series. Report the SHAs and subjects of the created commits, the results of
checks performed, and any material unfinished actions.

**Done when:** all planned commits have been created with the expected messages
and contents, and the remaining changes and index match the plan.
