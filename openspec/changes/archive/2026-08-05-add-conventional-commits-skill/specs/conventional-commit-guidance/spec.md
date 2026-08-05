## Purpose

Provide agents with a deterministic, specification-grounded way to select, construct, and validate Conventional Commit messages without external enforcement code.

## ADDED Requirements

### Requirement: Instruction-only skill is automatically discoverable

The repository SHALL provide a model-invoked skill named `conventional-commits` at `skills/conventional-commits/SKILL.md`. The skill package SHALL contain instructions only and SHALL NOT contain scripts, hooks, executables, or runtime dependencies.

#### Scenario: Agent receives a commit-message request

- **WHEN** a user asks an agent to choose a commit type or scope, assess a breaking change, write or review a commit message, or create a commit
- **THEN** the `conventional-commits` skill is eligible for model invocation and supplies the complete decision and validation guidance

#### Scenario: Skill package is inspected

- **WHEN** the contents of `skills/conventional-commits/` are reviewed
- **THEN** `SKILL.md` is the only required file and all enforcement behavior is expressed as instructions

### Requirement: Classification uses the complete change intent

Before selecting a type, the agent SHALL establish the single intent and consumer-visible effect of the complete change using the user request, available diff, affected contracts, and documented repository conventions. The agent SHALL classify by effect rather than by filename or directory. When independent intents require different mandatory types, the agent SHALL recommend separate commits and SHALL not invent one type that hides either intent.

#### Scenario: Production files contain a documentation-only change

- **WHEN** the diff changes comments or generated documentation without changing application or library behavior
- **THEN** the agent classifies the documentation intent instead of inferring `feat` or `fix` from the production file location

#### Scenario: Change contains an independent feature and bug fix

- **WHEN** one candidate commit contains a new capability and an unrelated defect correction
- **THEN** the agent requests or recommends splitting the changes into `feat` and `fix` commits before producing final messages

#### Scenario: Evidence is insufficient

- **WHEN** the available description or diff does not reveal whether behavior is new, defective, or unchanged
- **THEN** the agent asks for the missing intent or contract information before selecting a type

### Requirement: Base type follows Conventional Commits semantics

The agent SHALL use `feat` whenever the atomic change adds a feature to the application or library and SHALL use `fix` whenever it corrects a defect. For other atomic intents, the agent SHALL first honor a documented repository vocabulary and otherwise use a clearly defined compatible type such as `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `style`, `chore`, or `revert`. A fallback type SHALL be selected only after excluding `feat` and `fix`, and the base type SHALL be chosen independently from breaking-change status.

#### Scenario: New user-visible capability

- **WHEN** an atomic change gives application or library consumers a capability they did not previously have
- **THEN** the agent selects `feat`

#### Scenario: Defect correction

- **WHEN** an atomic change makes incorrect application or library behavior conform to its intended contract
- **THEN** the agent selects `fix`

#### Scenario: Behavior-preserving restructuring

- **WHEN** an atomic code change preserves observable behavior and only restructures implementation
- **THEN** the agent selects the repository's matching type or defaults to `refactor`

#### Scenario: Breaking defect correction

- **WHEN** a defect correction is also backward-incompatible
- **THEN** the agent retains `fix` as the base type and separately applies breaking-change notation

### Requirement: Breaking status reflects compatibility impact

The agent SHALL compare the before-and-after public contract independently from the base type. Public contracts SHALL include programmatic APIs and types, CLI commands and flags, configuration and environment variables, protocols and events, persisted and exchanged data formats, documented behavior and defaults, and supported runtimes or platforms. A change SHALL be classified as breaking when an existing consumer must change code, data, configuration, automation, or operating environment to remain compatible. Pre-1.0 versioning SHALL not suppress this classification.

#### Scenario: Required configuration migration

- **WHEN** a supported configuration key is removed or renamed without a compatible alias
- **THEN** the agent classifies the commit as breaking and identifies the required migration

#### Scenario: Compatible additive feature

- **WHEN** a new optional API is added without changing existing inputs, outputs, or defaults
- **THEN** the agent selects `feat` without breaking-change notation

#### Scenario: Internal-only refactor

- **WHEN** internal implementation changes leave every supported consumer contract compatible
- **THEN** the agent does not mark the commit as breaking

#### Scenario: Compatibility is uncertain

- **WHEN** the agent cannot determine whether consumers rely on the changed behavior or interface
- **THEN** the agent asks for contract and migration context before deciding whether to mark a breaking change

### Requirement: Generated breaking changes use explicit canonical notation

For every generated breaking-change message, the agent SHALL place `!` immediately before the header colon and SHALL include a canonical uppercase `BREAKING CHANGE: ` footer. The footer SHALL explain the incompatible contract and the action consumers must take. The selected base type SHALL continue to describe the underlying intent.

#### Scenario: Breaking feature with scope

- **WHEN** a new API design replaces an incompatible supported API in the `api` scope
- **THEN** the generated header starts with `feat(api)!: ` and the message includes a `BREAKING CHANGE: ` footer describing impact and migration

#### Scenario: Breaking non-feature change

- **WHEN** a build-related change drops a supported runtime version
- **THEN** the generated message retains the appropriate non-feature base type, places `!` before the colon, and explains the dropped support in the breaking footer

### Requirement: Generated messages conform to the 1.0.0 grammar

The agent SHALL construct messages as `<type>[optional scope][optional !]: <description>`, with a non-empty short description immediately after the colon and single space. A scope, when present, SHALL be a noun naming a codebase section inside parentheses. A body, when present, SHALL begin after one blank line and can contain multiple paragraphs. Footers, when present, SHALL begin after one blank line and use a word token followed by either `: ` or ` #`; whitespace inside footer tokens SHALL be represented by `-`, except for the canonical `BREAKING CHANGE` token. Generated types and scopes SHALL use consistent lowercase spelling, while `BREAKING CHANGE` SHALL remain uppercase.

#### Scenario: Message contains a body and multiple footers

- **WHEN** contextual explanation and references are needed
- **THEN** the agent separates the header, body, and footer block with blank lines and formats every footer as a valid trailer-style token and value

#### Scenario: Header contains scope and breaking marker

- **WHEN** both a scope and breaking marker are present
- **THEN** the prefix has the form `type(scope)!: ` rather than placing `!` elsewhere

### Requirement: Validation covers every normative 1.0.0 rule

`SKILL.md` SHALL identify [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/#specification) as the version-pinned normative authority for the skill's rules and audit. Before presenting, approving, or using a commit message, the agent SHALL audit it against every MUST, MUST NOT, REQUIRED, SHALL, and SHALL NOT rule in that specification. The audit SHALL cover prefix composition; mandatory `feat` and `fix` semantics; scope form; immediate description; body and footer separation; free-form multiline bodies; footer token, separator, and multiline value parsing; both breaking-change representations; the exact uppercase footer form; `!` placement and description behavior; additional types; case-insensitive information units except `BREAKING CHANGE`; and `BREAKING-CHANGE` footer-token equivalence. The agent SHALL correct or reject a candidate with any failed normative rule rather than using it.

#### Scenario: Normative source is inspected

- **WHEN** the authority cited by `SKILL.md` is reviewed
- **THEN** it links directly to the versioned Conventional Commits 1.0.0 specification section

#### Scenario: Breaking footer uses incorrect casing

- **WHEN** a candidate contains `breaking change: incompatible API`
- **THEN** the agent reports that the reserved token must be uppercase and produces the corrected canonical footer

#### Scenario: Existing message uses only a valid breaking marker

- **WHEN** an existing message uses `!` immediately before the colon, omits the breaking footer, and its description describes the breaking change
- **THEN** the agent recognizes the message as specification-compliant even though newly generated messages use both forms

#### Scenario: Existing message uses the equivalent footer token

- **WHEN** an existing message contains a valid `BREAKING-CHANGE: ` footer
- **THEN** the agent treats the token as synonymous with `BREAKING CHANGE` during compliance validation

#### Scenario: Candidate fails a normative rule

- **WHEN** any required prefix, separator, description, footer form, or breaking indicator is missing or malformed
- **THEN** the agent identifies the failed rule and withholds approval or commit use until the message is corrected

### Requirement: Compliance and release meaning remain distinct from optional style

The agent SHALL distinguish Conventional Commits 1.0.0 requirements from repository-specific style preferences. It SHALL recognize `feat` as a MINOR signal, `fix` as a PATCH signal, and any type carrying a breaking change as a MAJOR signal under the specification's SemVer correlation. Other types SHALL have no implicit SemVer effect unless repository tooling defines one. Optional preferences such as imperative mood, line length, or terminal punctuation SHALL not be presented as specification requirements.

#### Scenario: Additional valid type has no breaking marker

- **WHEN** a compliant `docs` commit is evaluated without repository-specific release rules
- **THEN** the agent accepts the type and assigns no implicit SemVer increment from Conventional Commits itself

#### Scenario: Repository policy is stricter than the specification

- **WHEN** documented local policy restricts types, scopes, or description style beyond Conventional Commits 1.0.0
- **THEN** the agent satisfies both policies while clearly attributing local constraints to the repository rather than to the specification
