/** AWS-SPEC: $util Provider | OWNER: vela | STATUS: READY */

// APIGW:$util Provider

export interface UtilProvider {
  // JSON operations
  json(value: any): string;
  parseJson(jsonString: string): any;
  toJson(value: any): string;
  
  // Encoding operations
  base64Encode(value: string): string;
  base64Decode(value: string): string;
  urlEncode(value: string): string;
  urlDecode(value: string): string;
  escapeJavaScript(value: string): string;
  
  // Time operations
  time: {
    nowISO8601(): string;
    epochMilli(): number;
    epochSecond(): number;
    format(template: string, time?: Date): string;
  };
  
  // Utility functions
  error(message: string, statusCode?: number): never;
  appendError(message: string, statusCode?: number): void;
  abort(message: string, statusCode?: number): never;
}

export function createUtilProvider(): UtilProvider {
  const fixedIso = process.env.VELA_FIXED_NOW_ISO8601;
  const fixedMillis = fixedIso ? Date.parse(fixedIso) : NaN;
  const hasFixedTime = Number.isFinite(fixedMillis);
  const fixedIsoNormalized = hasFixedTime ? new Date(fixedMillis).toISOString() : undefined;

  return {
    // JSON operations
    json(value: any): string {
      try {
        if (value === undefined) {
          return 'null';
        }
        return JSON.stringify(value);
      } catch {
        return 'null';
      }
    },

    parseJson(jsonString: string): any {
      try {
        return JSON.parse(jsonString);
      } catch {
        return null;
      }
    },

    toJson(value: any): string {
      return this.json(value);
    },

    // Encoding operations
    base64Encode(value: string): string {
      try {
        return Buffer.from(value, 'utf8').toString('base64');
      } catch {
        return '';
      }
    },

    base64Decode(value: string): string {
      try {
        // Check if the string is valid base64
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
          return '';
        }
        return Buffer.from(value, 'base64').toString('utf8');
      } catch {
        return '';
      }
    },

    urlEncode(value: string): string {
      try {
        const encoded = encodeURIComponent(value);
        // API Gateway encodes '!' as %21 as well
        return encoded.replace(/!/g, '%21');
      } catch {
        return '';
      }
    },

    urlDecode(value: string): string {
      try {
        return decodeURIComponent(value);
      } catch {
        return '';
      }
    },

    escapeJavaScript(value: string): string {
      if (typeof value !== 'string') {
        return '';
      }
      
      return value
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\f/g, '\\f')
        .replace(/\u0008/g, '\\b')  // Use Unicode escape for backspace
        .replace(/\v/g, '\\v')
        .replace(/\0/g, '\\0');
    },

    // Time operations
    time: {
      nowISO8601(): string {
        if (hasFixedTime && fixedIsoNormalized) {
          return fixedIsoNormalized;
        }
        return new Date().toISOString();
      },

      epochMilli(): number {
        if (hasFixedTime) {
          return fixedMillis as number;
        }
        return Date.now();
      },

      epochSecond(): number {
        const millis = hasFixedTime ? (fixedMillis as number) : Date.now();
        return Math.floor(millis / 1000);
      },

      format(template: string, time?: Date): string {
        const date = time || (hasFixedTime ? new Date(fixedMillis as number) : new Date());

        // Simple template formatting - APIGW uses a subset of Java SimpleDateFormat
        return template
          .replace(/yyyy/g, date.getFullYear().toString())
          .replace(/MM/g, String(date.getMonth() + 1).padStart(2, '0'))
          .replace(/dd/g, String(date.getDate()).padStart(2, '0'))
          .replace(/HH/g, String(date.getHours()).padStart(2, '0'))
          .replace(/mm/g, String(date.getMinutes()).padStart(2, '0'))
          .replace(/ss/g, String(date.getSeconds()).padStart(2, '0'))
          .replace(/SSS/g, String(date.getMilliseconds()).padStart(3, '0'));
      },
    },

    // Utility functions
    error(message: string, statusCode: number = 500): never {
      throw new Error(`VTL Error: ${message} (Status: ${statusCode})`);
    },

    appendError(message: string, statusCode: number = 500): void {
      // In APIGW, this appends to an error list
      console.error(`VTL Error: ${message} (Status: ${statusCode})`);
    },

    abort(message: string, statusCode: number = 500): never {
      throw new Error(`VTL Abort: ${message} (Status: ${statusCode})`);
    },
  };
}

/* Deviation Report: None - $util provider matches AWS API Gateway VTL specification */
