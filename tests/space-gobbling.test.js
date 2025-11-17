/**
 * Space Gobbling Test Suite
 *
 * This test suite is ported from Apache Velocity's SpaceGobblingTestCase.java
 * It tests all space gobbling modes: NONE, BC, LINES, STRUCTURED
 *
 * Reference: velocity-engine-core/src/test/java/org/apache/velocity/test/SpaceGobblingTestCase.java
 */

import { VelocityEngine } from '../dist/index.js';
import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const TEMPLATE_DIR = './tests/space-gobbling/templates';
const EXPECTED_DIR = './tests/space-gobbling/expected';

// Space gobbling modes (matching Java RuntimeConstants.SpaceGobbling enum)
const SpaceGobbling = {
  NONE: 'none',
  BC: 'bc',       // Backward Compatibility
  LINES: 'lines',
  STRUCTURED: 'structured'
};

describe('Space Gobbling - Java Test Suite Port', () => {

  // Get all template files
  const templates = readdirSync(TEMPLATE_DIR)
    .filter(f => f.endsWith('.vtl'))
    .sort();

  // Test each template against all gobbling modes
  templates.forEach(templateFile => {
    describe(`Template: ${templateFile}`, () => {

      Object.entries(SpaceGobbling).forEach(([modeName, modeValue]) => {

        it(`should match Java output in ${modeName} mode`, () => {
          // Read template
          const templatePath = join(TEMPLATE_DIR, templateFile);
          const template = readFileSync(templatePath, 'utf-8');

          // Read expected output for this mode
          const expectedPath = join(EXPECTED_DIR, `${templateFile}.${modeName}`);
          const expected = readFileSync(expectedPath, 'utf-8');

          // Create engine with specific space gobbling mode
          const engine = new VelocityEngine({
            spaceGobbling: modeValue
          });

          // Render template
          const context = {}; // Empty context like Java tests
          const result = engine.render(template, context);

          // Compare with expected output
          if (result !== expected) {
            // Provide detailed diff for debugging
            const resultLines = result.split('\n');
            const expectedLines = expected.split('\n');
            const maxLines = Math.max(resultLines.length, expectedLines.length);

            let diff = `\nOutput mismatch for ${templateFile} in ${modeName} mode:\n`;
            diff += `Expected ${expectedLines.length} lines, got ${resultLines.length} lines\n\n`;

            for (let i = 0; i < maxLines; i++) {
              const exp = expectedLines[i] ?? '<missing>';
              const res = resultLines[i] ?? '<missing>';
              if (exp !== res) {
                diff += `Line ${i + 1}:\n`;
                diff += `  Expected: ${JSON.stringify(exp)}\n`;
                diff += `  Got:      ${JSON.stringify(res)}\n`;
              }
            }

            diff += `\nExpected (raw):\n${JSON.stringify(expected)}\n`;
            diff += `\nGot (raw):\n${JSON.stringify(result)}\n`;

            throw new Error(diff);
          }

          expect(result).toBe(expected);
        });

      });

    });
  });

});
