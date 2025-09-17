# Vela

Vela is a TypeScript implementation of the AWS API Gateway Velocity Template Language (VTL) engine. It reproduces API Gateway's template evaluation behavior with a Chevrotain-based parser, scoped runtime, and provider implementations that mirror the `$util`, `$input`, and `$context` objects you would expect in production gateways.

## Features

- Chevrotain-driven lexer and parser with AWS-compatible precedence rules.
- Feature-flagged runtime that enables gradual rollout or dual-run comparisons.
- Provider implementations for `$util`, `$input`, and `$context` with API Gateway-compatible semantics.
- Golden conformance test runner and diffing tools for validating parity with AWS responses.

## Installation

```bash
# Clone the repository and install dependencies
npm install

# Compile the library and supporting tools
npm run build
```

## Usage

The library targets Node.js 22 and ships TypeScript sources. You can execute templates through the compiled runtime or by using the provided conformance runners.

```bash
# Run the conformance harness across all recorded test cases
npm run test:conf

# Execute the API Gateway simulator against a single template
npm run test:single
```

Templates and test fixtures live in the `tests/` directory. The `tools/run-apigw.ts` script emulates the AWS execution environment so you can experiment with new templates locally.

## AWS API Gateway Feature Parity

Vela follows the AWS API Gateway VTL specification tracked in [`docs/APIGW_SPEC.md`](docs/APIGW_SPEC.md). Progress toward full parity is captured below:

### Completed

- Core infrastructure: project structure, lexer, CST/AST mapping, runtime scope, and string builder.
- APIGW providers: `$util`, `$input`, `$context`, and the VTL engine with feature flag integration.
- Conformance tooling: golden tests, diff utilities, and documented test cases.

### In Progress

- Parser quality-of-life improvements like richer error messages, recovery, and source position tracking.
- Runtime enhancements including macro execution, additional JSONPath operators, and general performance tuning.

### Pending

- Advanced template directives such as `#parse` and `#include`, macro inheritance, and selection template support.
- Integration response mapping, legacy compatibility modes, and expanded performance/benchmark tooling.

For a detailed checklist of implemented and outstanding behaviors, see [`docs/APIGW_PROGRESS.md`](docs/APIGW_PROGRESS.md), which enumerates the exact items and conformance coverage.

## Support

- **Bug reports & feature requests:** Open an issue in the repository with reproduction steps and template samples when possible.
- **Security concerns:** Please use a private disclosure channel such as a direct maintainer email rather than filing a public issue.
- **Questions & discussions:** Start a GitHub discussion or reach out through the repository's preferred community forum.

If you are unsure where to start, the maintainers recommend reviewing the progress document and existing test cases before filing new issues to avoid duplicates.

## Contributing

1. Fork or clone the repository and create topic branches off `main`.
2. Run `npm run build` followed by `npm run test` to ensure changes pass all checks.
3. Submit a pull request that references any related issues and describes expected AWS parity behavior.

Contributions that expand conformance coverage or add missing API Gateway semantics are particularly welcome.
