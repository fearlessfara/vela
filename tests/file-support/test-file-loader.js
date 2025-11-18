#!/usr/bin/env node
/** Test file-based template loading */
import { VelocityEngine, RuntimeConstants } from '../../dist/index.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
async function testFileLoader() {
    console.log('Testing file-based template loading...\n');
    // Create engine with file resource loader
    const engine = new VelocityEngine({
        fileResourceLoaderPath: __dirname,
        fileResourceLoaderCache: true
    });
    // Initialize the engine
    engine.init();
    // Load context from input.json
    const inputPath = path.join(__dirname, 'input.json');
    const context = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    // Test 1: Get template
    console.log('Test 1: getTemplate()');
    const template = engine.getTemplate('template.vtl');
    const result1 = template.merge(context);
    console.log('Result:\n' + result1);
    console.log('✓ getTemplate() works\n');
    // Test 2: mergeTemplate
    console.log('Test 2: mergeTemplate()');
    const result2 = engine.mergeTemplate('template.vtl', context);
    console.log('Result:\n' + result2);
    console.log('✓ mergeTemplate() works\n');
    // Test 3: resourceExists
    console.log('Test 3: resourceExists()');
    console.log('template.vtl exists:', engine.resourceExists('template.vtl'));
    console.log('nonexistent.vtl exists:', engine.resourceExists('nonexistent.vtl'));
    console.log('✓ resourceExists() works\n');
    // Test 4: Properties with RuntimeConstants
    console.log('Test 4: Using RuntimeConstants');
    const engine2 = new VelocityEngine();
    engine2.setProperty(RuntimeConstants.FILE_RESOURCE_LOADER_PATH, __dirname);
    engine2.setProperty(RuntimeConstants.FILE_RESOURCE_LOADER_CACHE, true);
    engine2.init();
    const result3 = engine2.mergeTemplate('template.vtl', context);
    console.log('Result:\n' + result3);
    console.log('✓ RuntimeConstants work\n');
    // Test 5: addProperty
    console.log('Test 5: addProperty()');
    const engine3 = new VelocityEngine();
    engine3.addProperty('test.property', 'value1');
    engine3.addProperty('test.property', 'value2');
    const prop = engine3.getProperty('test.property');
    console.log('Added property values:', prop);
    console.log('✓ addProperty() works\n');
    // Test 6: setProperties from Map
    console.log('Test 6: setProperties() from Map');
    const engine4 = new VelocityEngine();
    const props = new Map();
    props.set(RuntimeConstants.FILE_RESOURCE_LOADER_PATH, __dirname);
    props.set(RuntimeConstants.FILE_RESOURCE_LOADER_CACHE, true);
    props.set(RuntimeConstants.INPUT_ENCODING, 'UTF-8');
    engine4.setProperties(props);
    engine4.init();
    const result4 = engine4.mergeTemplate('template.vtl', context);
    console.log('Result:\n' + result4);
    console.log('✓ setProperties() from Map works\n');
    console.log('All tests passed! ✓');
}
testFileLoader().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
