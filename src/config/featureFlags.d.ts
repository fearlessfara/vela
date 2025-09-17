/** AWS-SPEC: Feature Flags | OWNER: vela | STATUS: READY */
export type FeatureFlagValue = 'OFF' | 'DUAL' | 'ON';
export interface FeatureFlags {
    APIGW_MODE: FeatureFlagValue;
    APIGW_UTILS: FeatureFlagValue;
    APIGW_INPUT: FeatureFlagValue;
    APIGW_CONTEXT: FeatureFlagValue;
    APIGW_SELECTION_TEMPLATES: FeatureFlagValue;
    APIGW_INTEGRATION_RESP: FeatureFlagValue;
    APIGW_LEGACY_COMPAT: FeatureFlagValue;
}
export declare const DEFAULT_FLAGS: FeatureFlags;
export declare function isFlagEnabled(flags: FeatureFlags, flag: keyof FeatureFlags): boolean;
export declare function isFlagDual(flags: FeatureFlags, flag: keyof FeatureFlags): boolean;
