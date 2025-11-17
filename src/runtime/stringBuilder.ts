/** Apache Velocity: String Builder | OWNER: vela | STATUS: READY */

export class StringBuilder {
  private buffer: string[];
  private length: number;

  constructor(_initialCapacity: number = 1024) {
    this.buffer = [];
    this.length = 0;
  }

  append(value: any): void {
    if (value === null || value === undefined) {
      return;
    }

    // Handle float number formatting (Java Velocity preserves .0 for float results)
    if (typeof value === 'number') {
      const str = this.formatNumber(value);
      this.buffer.push(str);
      this.length += str.length;
      return;
    }

    // Check for wrapped float values with metadata
    if (value && typeof value === 'object' && '__float' in value) {
      const str = this.formatNumber(value.value, true);
      this.buffer.push(str);
      this.length += str.length;
      return;
    }

    const str = String(value);
    this.buffer.push(str);
    this.length += str.length;
  }

  private formatNumber(value: number, isFloat: boolean = false): string {
    // If it's a whole number and marked as float, add .0
    if (isFloat && Number.isInteger(value)) {
      return value.toFixed(1);
    }
    // Otherwise, use default JavaScript number formatting
    return String(value);
  }

  appendString(str: string): void {
    this.buffer.push(str);
    this.length += str.length;
  }

  peek(): string {
    return this.buffer.join('');
  }

  flush(): string {
    const result = this.buffer.join('');
    this.buffer = [];
    this.length = 0;
    return result;
  }

  getLength(): number {
    return this.length;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  clear(): void {
    this.buffer = [];
    this.length = 0;
  }

  // Efficient string building with minimal allocations
  toString(): string {
    return this.buffer.join('');
  }
}

