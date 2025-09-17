/** AWS-SPEC: Feature Flags | OWNER: vela | STATUS: READY */
export const DEFAULT_FLAGS = {
    APIGW_MODE: 'OFF',
    APIGW_UTILS: 'OFF',
    APIGW_INPUT: 'OFF',
    APIGW_CONTEXT: 'OFF',
    APIGW_SELECTION_TEMPLATES: 'OFF',
    APIGW_INTEGRATION_RESP: 'OFF',
    APIGW_LEGACY_COMPAT: 'OFF',
};
export function isFlagEnabled(flags, flag) {
    return flags[flag] === 'ON' || flags[flag] === 'DUAL';
}
export function isFlagDual(flags, flag) {
    return flags[flag] === 'DUAL';
}
/* Deviation Report: None - Feature flags implementation matches specification */
