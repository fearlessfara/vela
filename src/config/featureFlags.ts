/** AWS-SPEC: Feature Flags | OWNER: vela | STATUS: READY */

// APIGW:Feature Flags
export type FeatureFlagValue = 'OFF' | 'DUAL' | 'ON';

export interface FeatureFlags {
  APIGW_MODE: FeatureFlagValue;
  APIGW_UTILS: FeatureFlagValue;
  APIGW_INPUT: FeatureFlagValue;
  APIGW_CONTEXT: FeatureFlagValue;
  APIGW_SELECTION_TEMPLATES: FeatureFlagValue;
  APIGW_INTEGRATION_RESP: FeatureFlagValue;
  APIGW_LEGACY_COMPAT: FeatureFlagValue;
  VELOCITY_COUNT_SUPPORT: FeatureFlagValue;
  ENHANCED_FOREACH_SCOPE: FeatureFlagValue;
  CONFIGURABLE_ITERATOR_NAMES: FeatureFlagValue;
  SKIP_INVALID_ITERATOR: FeatureFlagValue;
}

export const DEFAULT_FLAGS: FeatureFlags = {
  APIGW_MODE: 'OFF',
  APIGW_UTILS: 'OFF',
  APIGW_INPUT: 'OFF',
  APIGW_CONTEXT: 'OFF',
  APIGW_SELECTION_TEMPLATES: 'OFF',
  APIGW_INTEGRATION_RESP: 'OFF',
  APIGW_LEGACY_COMPAT: 'OFF',
  VELOCITY_COUNT_SUPPORT: 'ON',
  ENHANCED_FOREACH_SCOPE: 'ON',
  CONFIGURABLE_ITERATOR_NAMES: 'ON',
  SKIP_INVALID_ITERATOR: 'OFF',
};

export function isFlagEnabled(flags: FeatureFlags, flag: keyof FeatureFlags): boolean {
  return flags[flag] === 'ON' || flags[flag] === 'DUAL';
}

export function isFlagDual(flags: FeatureFlags, flag: keyof FeatureFlags): boolean {
  return flags[flag] === 'DUAL';
}

/* Deviation Report: None - Feature flags implementation matches specification */
