/** AWS-SPEC: String Builder | OWNER: vela | STATUS: READY */

// APIGW:String Builder

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
    
    const str = String(value);
    this.buffer.push(str);
    this.length += str.length;
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

/* Deviation Report: None - String builder matches AWS API Gateway VTL specification */
