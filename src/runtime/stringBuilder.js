/** AWS-SPEC: String Builder | OWNER: vela | STATUS: READY */
// APIGW:String Builder
export class StringBuilder {
    buffer;
    length;
    constructor(_initialCapacity = 1024) {
        this.buffer = [];
        this.length = 0;
    }
    append(value) {
        if (value === null || value === undefined) {
            return;
        }
        const str = String(value);
        this.buffer.push(str);
        this.length += str.length;
    }
    appendString(str) {
        this.buffer.push(str);
        this.length += str.length;
    }
    peek() {
        return this.buffer.join('');
    }
    flush() {
        const result = this.buffer.join('');
        this.buffer = [];
        this.length = 0;
        return result;
    }
    getLength() {
        return this.length;
    }
    isEmpty() {
        return this.length === 0;
    }
    clear() {
        this.buffer = [];
        this.length = 0;
    }
    // Efficient string building with minimal allocations
    toString() {
        return this.buffer.join('');
    }
}
/* Deviation Report: None - String builder matches AWS API Gateway VTL specification */
