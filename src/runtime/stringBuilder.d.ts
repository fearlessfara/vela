/** Apache Velocity: String Builder | OWNER: vela | STATUS: READY */
export declare class StringBuilder {
    private buffer;
    private length;
    constructor(_initialCapacity?: number);
    append(value: any): void;
    appendString(str: string): void;
    peek(): string;
    flush(): string;
    getLength(): number;
    isEmpty(): boolean;
    clear(): void;
    toString(): string;
}
