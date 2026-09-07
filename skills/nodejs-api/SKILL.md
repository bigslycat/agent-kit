---
name: nodejs-api
description: >
  Node.js version-aware API and CLI lookup. Use when verifying built-in APIs or
  flags, checking compatibility across Node.js versions, finding implementations
  with apilinks.json, or creating and reviewing node.config.json with
  node-config-schema.json. Not for generic JavaScript, framework APIs, or
  Node.js core contribution workflows.
license: MIT
---

# Node.js API

Resolve runtime contracts from version-pinned official documentation. Retrieve
only the evidence needed for the current API, option, or compatibility decision.

## 1. Establish The Version

- Identify the required version or supported range from the request, `engines`,
  version-manager files, CI/container configuration, and deployment requirements.
  Local `node --version` identifies the executable, not every supported runtime;
  `@types/node` is not proof of runtime availability.
- Pin lookups to `vX.Y.Z`. For ranges, check the relevant lower bounds and changes
  on each supported release line. A recent patch does not establish support in
  earlier patches of the same major. Resolve conflicting requirements before
  making a compatibility claim; ask only if the conflict blocks the decision.
- For an explicitly requested latest release, resolve the moving alias to an
  exact version using official release metadata or the documentation's version
  banner. Record that version; do not silently retarget the project.

## 2. Choose The Evidence

Use `https://nodejs.org/docs/<version>/` as the base:

| Artifact                  | Purpose                                                    |
| ------------------------- | ---------------------------------------------------------- |
| `llms.txt`                | Discover section names when the section is unknown.        |
| `api/<section>.md`        | Read the API contract, examples, history, and caveats.     |
| `api/<section>.json`      | Query structured documentation for a specific symbol.      |
| `apilinks.json`           | Locate candidate implementation source, not API contracts. |
| `node-config-schema.json` | Discover and validate the runtime configuration format.    |

Prefer a known section directly: `fs`, `esm`, `modules`, `packages`, `typescript`,
`cli`, or the relevant built-in module. Small pages work with `webfetch` or an
equivalent plain HTTP tool; a browser or scraper is unnecessary for static docs.
For large Markdown/HTML pages, retrieve a section or search a saved response.
An URL fragment alone does not guarantee that a fetch tool returns only a section.

Keep followed links on the target version: versioned `llms.txt` can link to
`latest`, and source links can use `HEAD`. Resolve relative links against the
pinned document. If an older release lacks an artifact, check its `api/index.html`,
CLI docs, or `doc/api/` at the matching Node.js Git tag; never substitute `latest`
as evidence for that release. Distinguish HTTP failure from API absence.

Check the exact method, option, overload, and enclosing section. Read `added`,
`changes`, stability, required flags, platform/build constraints, and relevant
deprecations. Module availability does not establish availability of every option.
Use that version's `api/documentation` stability definitions: `1.x` is experimental
(including release candidates), `2` stable, and `3` legacy, not "more stable".

## 3. Reduce Before Context

**Before fetching or querying large JSON, read
[JSON Queries](references/json-queries.md).** This also applies to release indexes
and API JSON, not only the two root-level JSON files.

Prefer a tool-side selector or an existing complete output file. Otherwise download
once to a fresh, version-labelled snapshot in permitted temporary storage without
printing the payload. Retain the URL and retrieval status; query only a successful,
complete capture. Inspect bounded shape metadata before choosing paths.

Return exact keys or bounded matches with paths and an explicit overflow marker.
Expand only the selected record and necessary parent context. Minification,
printing the first lines of one-line JSON, and truncating a raw document before
parsing do not provide a reliable context reduction. Reuse the snapshot for query
corrections. If no selector or file access is available, use focused documentation
instead of dumping a large JSON response into context.

## 4. Follow Implementation Links

Query `apilinks.json` for the symbol. Treat the result as a source-location hint:
keys may be internal, incomplete, or ambiguous (`server.close`), and a location
may be an export or wrapper. A missing entry does not prove the API is missing.
Pin a moving Git ref to the target release tag, then verify the symbol, owner,
and line in that source. Follow internals only as needed; implementation details
do not replace the documented public contract.

## 5. Check Runtime Configuration

For `node.config.json`, inspect the target `node-config-schema.json` structure and
follow its `$ref` links. Layouts vary: do not reuse a JSON path from another release.
Extract the relevant namespace and option; validate against the complete schema
with a validator supporting its declared dialect, not just an extracted fragment.

Read that release's `cli` section for the config-loading flag, accepted namespaces,
automatic mode activation, version selection, duplicate-key rules, and precedence
against CLI flags and `NODE_OPTIONS`. `$schema` is editor/validation metadata, not
a command to load the file or select the Node.js executable. The schema is not a
complete inventory of CLI flags and does not capture every value constraint.

Schema-valid is neither runtime-verified nor safe to execute: configuration can
preload code. Test only trusted configuration with the intended Node.js executable
when execution is permitted. Otherwise report the remaining validation gap.

## Completion

Report the target version, relevant compatibility/stability constraints, and a
pinned documentation link. Distinguish documented behavior from observed runtime
behavior; for changes, run a focused test on the required runtime when available.
Stop retrieving once the decision is supported; keep unrelated API data out.
