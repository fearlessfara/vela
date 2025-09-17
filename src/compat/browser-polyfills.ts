/**
 * Browser polyfills for Node.js-specific APIs
 * AWS-SPEC: N/A | OWNER: fearlessfara | STATUS: READY
 */

// Polyfill for process.env
export const process = {
  env: typeof globalThis !== 'undefined' && globalThis.process?.env || {}
};

// Polyfill for Buffer
export class Buffer {
  static from(value: string, encoding: 'utf8' | 'base64' = 'utf8'): Buffer {
    if (encoding === 'utf8') {
      return new Buffer(new TextEncoder().encode(value));
    } else if (encoding === 'base64') {
      const binaryString = atob(value);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new Buffer(bytes);
    }
    throw new Error(`Unsupported encoding: ${encoding}`);
  }

  constructor(private data: Uint8Array) {}

  toString(encoding: 'utf8' | 'base64' = 'utf8'): string {
    if (encoding === 'utf8') {
      return new TextDecoder().decode(this.data);
    } else if (encoding === 'base64') {
      let binaryString = '';
      for (let i = 0; i < this.data.length; i++) {
        binaryString += String.fromCharCode(this.data[i] || 0);
      }
      return btoa(binaryString);
    }
    throw new Error(`Unsupported encoding: ${encoding}`);
  }
}

// Make Buffer available globally for browser compatibility
if (typeof globalThis !== 'undefined' && !(globalThis as any).Buffer) {
  (globalThis as any).Buffer = Buffer;
}

// Make process available globally for browser compatibility
if (typeof globalThis !== 'undefined' && !(globalThis as any).process) {
  (globalThis as any).process = process;
}
