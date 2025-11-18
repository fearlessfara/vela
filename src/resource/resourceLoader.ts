/** Apache Velocity: Resource Loaders | OWNER: vela | STATUS: READY */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Base interface for resource loaders
 */
export interface ResourceLoader {
  /**
   * Initialize the resource loader with configuration
   */
  init(configuration: Map<string, any>): void;

  /**
   * Get a resource as a string
   */
  getResourceAsString(name: string, encoding?: string): Promise<string>;

  /**
   * Get a resource as a string (synchronous)
   */
  getResourceAsStringSync(name: string, encoding?: string): string;

  /**
   * Check if a resource exists
   */
  resourceExists(name: string): boolean;

  /**
   * Get the last modified time of a resource
   */
  getLastModified(name: string): number;

  /**
   * Check if caching is enabled
   */
  isCachingEnabled(): boolean;
}

/**
 * File-based resource loader
 * Port of org.apache.velocity.runtime.resource.loader.FileResourceLoader
 */
export class FileResourceLoader implements ResourceLoader {
  private paths: string[] = [];
  private cachingEnabled: boolean = false;
  private encoding: string = 'UTF-8';

  /**
   * Initialize the file resource loader
   */
  init(configuration: Map<string, any>): void {
    // Get paths from configuration
    const pathsConfig = configuration.get('path') || configuration.get('paths');

    if (typeof pathsConfig === 'string') {
      // Split by comma or semicolon
      this.paths = pathsConfig.split(/[,;]/).map(p => p.trim()).filter(p => p.length > 0);
    } else if (Array.isArray(pathsConfig)) {
      this.paths = pathsConfig;
    } else if (pathsConfig) {
      this.paths = [String(pathsConfig)];
    }

    // Get caching setting
    const cache = configuration.get('cache');
    this.cachingEnabled = cache === true || cache === 'true';

    // Get default encoding
    const enc = configuration.get('encoding');
    if (enc) {
      this.encoding = String(enc);
    }
  }

  /**
   * Get a resource as a string (async)
   */
  async getResourceAsString(name: string, encoding?: string): Promise<string> {
    const enc = encoding || this.encoding;
    const filePath = this.findResource(name);

    if (!filePath) {
      throw new Error(`Resource not found: ${name}`);
    }

    return fs.promises.readFile(filePath, { encoding: enc as BufferEncoding });
  }

  /**
   * Get a resource as a string (synchronous)
   */
  getResourceAsStringSync(name: string, encoding?: string): string {
    const enc = encoding || this.encoding;
    const filePath = this.findResource(name);

    if (!filePath) {
      throw new Error(`Resource not found: ${name}`);
    }

    return fs.readFileSync(filePath, { encoding: enc as BufferEncoding });
  }

  /**
   * Check if a resource exists
   */
  resourceExists(name: string): boolean {
    return this.findResource(name) !== null;
  }

  /**
   * Get the last modified time of a resource
   */
  getLastModified(name: string): number {
    const filePath = this.findResource(name);
    if (!filePath) {
      return 0;
    }

    try {
      const stats = fs.statSync(filePath);
      return stats.mtimeMs;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Check if caching is enabled
   */
  isCachingEnabled(): boolean {
    return this.cachingEnabled;
  }

  /**
   * Add a path to search for resources
   */
  addPath(searchPath: string): void {
    if (!this.paths.includes(searchPath)) {
      this.paths.push(searchPath);
    }
  }

  /**
   * Get all configured paths
   */
  getPaths(): string[] {
    return [...this.paths];
  }

  /**
   * Find a resource in the configured paths
   * @private
   */
  private findResource(name: string): string | null {
    // If paths is empty, use current directory
    if (this.paths.length === 0) {
      this.paths = [process.cwd()];
    }

    for (const basePath of this.paths) {
      const fullPath = path.resolve(basePath, name);

      // Security check: ensure the resolved path is under the base path
      const normalizedBase = path.resolve(basePath);
      const normalizedFull = path.resolve(fullPath);

      if (!normalizedFull.startsWith(normalizedBase)) {
        continue; // Skip paths outside the base directory
      }

      if (fs.existsSync(fullPath)) {
        try {
          const stats = fs.statSync(fullPath);
          if (stats.isFile()) {
            return fullPath;
          }
        } catch (e) {
          // Continue to next path
        }
      }
    }

    return null;
  }
}

/**
 * String-based resource loader (for in-memory templates)
 */
export class StringResourceLoader implements ResourceLoader {
  private resources: Map<string, { content: string; lastModified: number }> = new Map();
  private cachingEnabled: boolean = true;

  init(configuration: Map<string, any>): void {
    const cache = configuration.get('cache');
    this.cachingEnabled = cache !== false && cache !== 'false';
  }

  async getResourceAsString(name: string, encoding?: string): Promise<string> {
    return this.getResourceAsStringSync(name, encoding);
  }

  getResourceAsStringSync(name: string, _encoding?: string): string {
    const resource = this.resources.get(name);
    if (!resource) {
      throw new Error(`Resource not found: ${name}`);
    }
    return resource.content;
  }

  resourceExists(name: string): boolean {
    return this.resources.has(name);
  }

  getLastModified(name: string): number {
    const resource = this.resources.get(name);
    return resource ? resource.lastModified : 0;
  }

  isCachingEnabled(): boolean {
    return this.cachingEnabled;
  }

  /**
   * Put a string resource into the repository
   */
  putStringResource(name: string, content: string): void {
    this.resources.set(name, {
      content,
      lastModified: Date.now()
    });
  }

  /**
   * Remove a string resource from the repository
   */
  removeStringResource(name: string): boolean {
    return this.resources.delete(name);
  }

  /**
   * Clear all string resources
   */
  clearStringResources(): void {
    this.resources.clear();
  }
}
