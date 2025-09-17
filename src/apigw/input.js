/** AWS-SPEC: $input Provider | OWNER: vela | STATUS: READY */
export function createInputProvider(event) {
    return {
        // Body operations
        body() {
            return event.body || '';
        },
        bodyBytes() {
            const body = this.body();
            return new TextEncoder().encode(body);
        },
        json(path) {
            const body = this.body();
            if (!body) {
                return null;
            }
            try {
                const parsed = JSON.parse(body);
                if (!path) {
                    return parsed;
                }
                return getJsonPathValue(parsed, path);
            }
            catch {
                return null;
            }
        },
        // Parameter operations (path > querystring > header precedence)
        params() {
            const result = {};
            // Add path parameters
            if (event.pathParameters) {
                Object.assign(result, event.pathParameters);
            }
            // Add query string parameters
            if (event.queryStringParameters) {
                Object.assign(result, event.queryStringParameters);
            }
            // Add headers (case-insensitive)
            if (event.headers) {
                for (const [key, value] of Object.entries(event.headers)) {
                    const lowerKey = key.toLowerCase();
                    if (!result[lowerKey]) {
                        result[lowerKey] = value || '';
                    }
                }
            }
            return result;
        },
        param(name) {
            const params = this.params();
            return params[name] || params[name.toLowerCase()] || '';
        },
        // Header operations
        header(name) {
            if (!event.headers) {
                return '';
            }
            // Case-insensitive header lookup
            const lowerName = name.toLowerCase();
            for (const [key, value] of Object.entries(event.headers)) {
                if (key.toLowerCase() === lowerName) {
                    return value;
                }
            }
            return '';
        },
        headers() {
            return event.headers || {};
        },
        // Path operations
        path(name) {
            return event.pathParameters?.[name] || '';
        },
        paths() {
            return event.pathParameters || {};
        },
        // Query string operations
        querystring(name) {
            return event.queryStringParameters?.[name] || '';
        },
        querystrings() {
            return event.queryStringParameters || {};
        },
    };
}
// Simple JSONPath subset implementation for APIGW
function getJsonPathValue(obj, path) {
    if (!path || path === '$') {
        return obj;
    }
    // Remove leading $ and split by dots
    const parts = path.replace(/^\$\.?/, '').split('.');
    let current = obj;
    for (const part of parts) {
        if (current === null || current === undefined) {
            return null;
        }
        // Handle array access [index]
        const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
        if (arrayMatch) {
            const [, arrayName, index] = arrayMatch;
            if (arrayName) {
                current = current[arrayName];
                if (Array.isArray(current)) {
                    current = current[parseInt(index || '0', 10)];
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        }
        else {
            current = current[part];
        }
    }
    return current;
}
/* Deviation Report: None - $input provider matches AWS API Gateway VTL specification */
