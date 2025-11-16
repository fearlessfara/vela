/** Apache Velocity: Java Runner | OWNER: vela | STATUS: READY */

import { exec } from 'child_process';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

export interface JavaRunnerOptions {
  template: string;
  context: Record<string, any>;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Runs a Velocity template using the Java reference implementation
 */
export async function runJavaVelocity(options: JavaRunnerOptions): Promise<string> {
  const { template, context } = options;
  
  const jarDir = join(__dirname, 'jars');
  const runnerClass = join(__dirname, 'VelocityRunner.class');
  
  // Check if JARs and compiled class exist
  if (!existsSync(join(jarDir, 'velocity-engine-core-2.3.jar'))) {
    throw new Error(
      'Velocity JARs not found. Please run: cd tools/compare-velocity && bash setup-java-runner.sh'
    );
  }
  
  if (!existsSync(runnerClass)) {
    throw new Error(
      'VelocityRunner.class not found. Please compile: cd tools/compare-velocity && javac -cp "jars/*" VelocityRunner.java'
    );
  }
  
  // Escape template and context JSON for shell
  const escapedTemplate = template.replace(/'/g, "'\"'\"'");
  const contextJson = JSON.stringify(context);
  const escapedContext = contextJson.replace(/'/g, "'\"'\"'");
  
  // Run Java program
  // Use proper classpath separator for the platform
  const pathSeparator = process.platform === 'win32' ? ';' : ':';
  const classpath = `jars/*${pathSeparator}${__dirname}`;
  const command = `java -cp "${classpath}" VelocityRunner '${escapedTemplate}' '${escapedContext}'`;
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: __dirname,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    
    if (stderr && !stderr.includes('Picked up')) {
      // Ignore Java warnings about JAVA_TOOL_OPTIONS
      if (!stderr.includes('JAVA_TOOL_OPTIONS')) {
        console.warn('Java stderr:', stderr);
      }
    }
    
    return stdout;
  } catch (error: any) {
    if (error.stdout) {
      // Sometimes errors go to stdout
      return error.stdout;
    }
    throw new Error(`Java runner failed: ${error.message}\n${error.stderr || ''}`);
  }
}
