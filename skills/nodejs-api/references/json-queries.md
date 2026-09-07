# JSON Queries

Read before retrieving large Node.js JSON artifacts. These are selective views,
not copies of the source. Use an available JSON selector or local parser; the
examples use jq and POSIX-shell quoting. Check tool availability rather than
installing dependencies just for a lookup.

## Capture And Inspect

Prefer an existing complete tool-output file. Otherwise use a permitted downloader
that saves the response without printing it, such as
`curl --fail --silent --show-error --location --output "$snapshot" "$url"`.
Use a fresh path in an approved temporary directory, labelled with the exact Node.js
version and artifact. Confirm download success before parsing; a failed download
can leave partial bytes. Keep the source URL/status beside the query results and
reuse the same capture. JSON visible only in chat is not a shell-accessible file.

Examples below assume successful captures named `v26.8.1-apilinks.json`,
`v26.8.1-fs.json`, and `v26.8.1-schema.json`. These are example snapshots, not a
required Node.js version or files bundled with the skill.

First confirm the expected top-level object and inspect at most 12 keys:

```sh
jq 'if type == "object" then
      {file:input_filename, key_count:(keys|length), keys:keys[:12]}
    else error("expected an object") end' v26.8.1-schema.json
```

The key list is a sample when `key_count > 12`. Parse errors, HTML error responses,
and unexpected shapes are failures to investigate, not empty search results.

## Implementation Lookup

After confirming the flat object shape, look up one exact key:

```sh
jq --arg symbol 'fs.readFile' '
  {file:input_filename, symbol:$symbol, found:has($symbol), source:.[$symbol]}
' v26.8.1-apilinks.json
```

Preserve `found:false` as an index miss. For uncertain spelling, list only matching
keys with a bounded result, then perform an exact lookup. Validate the returned
source's release ref and owning module before relying on it.

## API Record Discovery

API JSON nests modules, classes, methods, and overloads. A top-level `.methods`
lookup or an unqualified name is insufficient. This query emits at most ten
matching headings and paths, using an eleventh match only to detect overflow:

```sh
jq --arg name 'readFile' '
  input_filename as $file |
  [limit(11; paths(objects) as $path | getpath($path) |
    select(.name == $name and has("textRaw")) |
    {path:$path, heading:.textRaw})] |
  {file:$file, name:$name, more_matches:(length>10), matches:.[0:10]}
' v26.8.1-fs.json
```

Choose the heading for `fs.readFile`, `fsPromises.readFile`, or
`filehandle.readFile` as appropriate. The returned paths are specific to this
snapshot; array indices can change between versions. If `more_matches` is true,
narrow by owner/subtree rather than treating ten results as the complete set.

Use `getpath($path)` with the selected path passed through `--argjson` to retrieve
only the needed fields, such as `textRaw`, `meta`, or `signatures`. Inspect parent
sections for inherited stability and surrounding caveats. For lengthy `desc`
fields, start with a bounded excerpt and its full character count; label it
incomplete and retrieve the relevant remainder before claiming coverage. Expanding
an entire matched module can reintroduce the whole document through descendants.

## Configuration Schema Lookup

Inspect the root's `$schema`, `$ref`, `oneOf`, and definition names without
dumping definition bodies. Follow referenced containers before selecting options.
For example, v26.8.1 references `$defs.config`, whose `properties` holds namespaces;
v22.16.0 instead places configuration `properties` directly at the root.

After establishing the parent path in v26.8.1, extract one option definition:

```sh
jq --argjson parent '["$defs","config","properties","nodeOptions","properties"]' \
   --arg key 'watch' '
  input_filename as $file | getpath($parent) |
  if type == "object" then
    {file:$file, path:($parent+[$key]), found:has($key), definition:.[$key]}
  else error("inspect the schema layout before choosing this path") end
' v26.8.1-schema.json
```

For the inspected v22.16.0 schema, the corresponding parent is
`["properties","nodeOptions","properties"]`. Discover other versions rather
than guessing a fixed list of compatible layouts. `has` preserves the distinction
between missing entries and present values, including a boolean `false` schema.
Resolve any `$ref` in the selected definition and retain its parent constraints.
Validate a candidate config against the full original schema; a property excerpt
does not enforce root structure, namespace rules, or cross-field constraints.

## Keep Queries Bounded

- Pass external names with `--arg` and paths with `--argjson`, not interpolation
  into jq source. Adapt quoting for non-POSIX shells.
- Project fields before output and bound result counts; also bound large text
  fields explicitly. Keep paths, versions, counts, and truncation markers.
- An unexpected path or parse error must remain visible. Use `?`, `// empty`, or
  other suppression only for a documented optional/variant shape.
- `jq -c .` still emits every value. Query a section JSON instead of `api/all.json`;
  do not pretty-print an entire artifact just to search it.
- Context savings and process memory are different concerns. Ordinary jq can
  parse a snapshot without emitting it. Use `--stream` only when memory requires
  it and the filter handles its path/value event format; it is not a drop-in flag.
