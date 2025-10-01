Velocity Parity Cases

Structure
- cases/<name>/template.vtl — required template
- cases/<name>/context.json — optional JSON context

Run
- All cases: `npm run compare:velocity`
- List cases: `npm run compare:velocity -- --list`
- Filter by name: `npm run compare:velocity -- --only <substring>` (repeatable)
- Custom root: `npm run compare:velocity -- --casesRoot comparisons/velocity/cases`
- Quiet output: `npm run compare:velocity -- --quiet`
 - Scaffold a new case: `npm run compare:velocity:new -- <case-name>`

Add a case
1) Create `comparisons/velocity/cases/<case-name>/template.vtl`
2) Optionally add `context.json`
3) Run `npm run compare:velocity -- --only <case-name>`

Or scaffold it automatically:
- `npm run compare:velocity:new -- <case-name>`
- Then edit the generated `template.vtl` and `context.json`

Notes
- The Java runner builds and executes Apache Velocity 2.4.1 to produce canonical outputs.
- The TS engine is @fearlessfara/vela core. The harness diffs outputs line-by-line.
