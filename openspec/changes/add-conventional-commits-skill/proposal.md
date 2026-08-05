## Why

Agents currently have no repository-provided guidance for selecting and validating Conventional Commit messages, so valid syntax alone can still hide an incorrect type or an unmarked breaking change. A dedicated skill is needed to make commit classification and Conventional Commits 1.0.0 compliance deliberate and repeatable.

## What Changes

- Add a model-invoked, instruction-only agent skill under `skills/` for creating and reviewing Conventional Commit messages.
- Define a deterministic decision process that derives the commit type from the change's intent rather than its filenames, with the specification-mandated `feat` and `fix` choices taking precedence.
- Analyze backward compatibility independently from the base type and require explicit breaking-change notation and explanation when a public contract becomes incompatible.
- Cover optional scope, description, body, and footer construction, including the exact placement and casing rules from Conventional Commits 1.0.0.
- Require an exhaustive compliance audit before the agent presents or uses a commit message, and require clarification or commit splitting when the change cannot be classified unambiguously.
- Keep the skill self-contained as instructions only, with no scripts, hooks, or runtime dependencies.

## Capabilities

### New Capabilities

- `conventional-commit-guidance`: Select, construct, and validate Conventional Commit messages against version 1.0.0, including type and breaking-change decisions.

### Modified Capabilities

- None.

## Impact

- Adds `skills/conventional-commits/SKILL.md` and the new `skills/` directory if it does not yet exist.
- Affects agent behavior when writing, reviewing, or using commit messages; it does not change application APIs or runtime behavior.
- Adds no scripts, package dependencies, Git hooks, or external services.
- Instruction-level checks make compliance a blocking agent workflow, while mechanical enforcement outside the agent remains intentionally out of scope.
