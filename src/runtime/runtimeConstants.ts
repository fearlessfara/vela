/** Apache Velocity: Runtime Constants | OWNER: vela | STATUS: READY */

/**
 * This module defines the keys that are used in the velocity.properties file
 * so that they can be referenced as constants within TypeScript code.
 *
 * Port of org.apache.velocity.runtime.RuntimeConstants from Java implementation
 */

/**
 * Space gobbling modes (matches Java RuntimeConstants.SpaceGobbling enum)
 */
export enum SpaceGobbling {
  NONE = 'none',
  BC = 'bc',
  LINES = 'lines',
  STRUCTURED = 'structured'
}

/**
 * Runtime Constants - Configuration property keys
 */
export const RuntimeConstants = {
  /*
   * ----------------------------------------------------------------------
   * L O G G I N G  C O N F I G U R A T I O N
   * ----------------------------------------------------------------------
   */

  /** externally provided logger instance. */
  RUNTIME_LOG_INSTANCE: 'runtime.log.instance',

  /** externally provided logger name. */
  RUNTIME_LOG_NAME: 'runtime.log.name',

  /** Logging of invalid references. */
  RUNTIME_LOG_REFERENCE_LOG_INVALID: 'runtime.log.log_invalid_references',

  /** Logging of invalid method calls. */
  RUNTIME_LOG_METHOD_CALL_LOG_INVALID: 'runtime.log.log_invalid_method_calls',

  /** Whether to populate MDC with location in template file and display VTL stack trace on errors */
  RUNTIME_LOG_TRACK_LOCATION: 'runtime.log.track_location',

  /*
   * ----------------------------------------------------------------------
   * D I R E C T I V E  C O N F I G U R A T I O N
   * ----------------------------------------------------------------------
   */

  /** Maximum allowed number of loops. */
  MAX_NUMBER_LOOPS: 'directive.foreach.max_loops',

  /** Whether to throw an exception or just skip bad iterables. Default is true. */
  SKIP_INVALID_ITERATOR: 'directive.foreach.skip_invalid',

  /** An empty object (string, collection) or zero number is false. */
  CHECK_EMPTY_OBJECTS: 'directive.if.empty_check',

  /** Maximum recursion depth allowed for the #parse directive. */
  PARSE_DIRECTIVE_MAXDEPTH: 'directive.parse.max_depth',

  /** Maximum recursion depth allowed for the #define directive. */
  DEFINE_DIRECTIVE_MAXDEPTH: 'directive.define.max_depth',

  /** Used to enable or disable a scope control */
  CONTEXT_SCOPE_CONTROL: 'context.scope_control',

  /** Vector of custom directives */
  CUSTOM_DIRECTIVES: 'runtime.custom_directives',

  /*
   * ----------------------------------------------------------------------
   *  R E S O U R C E   M A N A G E R   C O N F I G U R A T I O N
   * ----------------------------------------------------------------------
   */

  /** The resource.manager.instance property specifies an existing instance */
  RESOURCE_MANAGER_INSTANCE: 'resource.manager.instance',

  /** The resource.manager.class property specifies the implementation to use */
  RESOURCE_MANAGER_CLASS: 'resource.manager.class',

  /** The resource.manager.cache.class property specifies the cache implementation */
  RESOURCE_MANAGER_CACHE_CLASS: 'resource.manager.cache.class',

  /** The resource.manager.cache.size property specifies the cache upper bound */
  RESOURCE_MANAGER_DEFAULTCACHE_SIZE: 'resource.manager.cache.default_size',

  /*
   * ----------------------------------------------------------------------
   * R E S O U R C E  L O A D E R  C O N F I G U R A T I O N
   * ----------------------------------------------------------------------
   */

  /** controls if the finding of a resource is logged. */
  RESOURCE_MANAGER_LOGWHENFOUND: 'resource.manager.log_when_found',

  /** Key used to retrieve the names of the resource loaders to be used */
  RESOURCE_LOADERS: 'resource.loaders',

  /** Key prefix for a specific resource loader properties */
  RESOURCE_LOADER: 'resource.loader',

  /** The public handle for setting paths in the FileResourceLoader */
  FILE_RESOURCE_LOADER_PATH: 'resource.loader.file.path',

  /** The public handle for turning the caching on in the FileResourceLoader */
  FILE_RESOURCE_LOADER_CACHE: 'resource.loader.file.cache',

  /** Resource loader class property suffix */
  RESOURCE_LOADER_CLASS: 'class',

  /** Resource loader instance property suffix */
  RESOURCE_LOADER_INSTANCE: 'instance',

  /** Resource loader cache property suffix */
  RESOURCE_LOADER_CACHE: 'cache',

  /** File resource loader paths property suffix */
  RESOURCE_LOADER_PATHS: 'path',

  /** Resource loader modification check interval property suffix */
  RESOURCE_LOADER_CHECK_INTERVAL: 'modification_check_interval',

  /** The default character encoding for the templates */
  INPUT_ENCODING: 'resource.default_encoding',

  /** Default Encoding is UTF-8. */
  ENCODING_DEFAULT: 'UTF-8',

  /*
   * ----------------------------------------------------------------------
   *  E V E N T  H A N D L E R  C O N F I G U R A T I O N
   * ----------------------------------------------------------------------
   */

  /** The event_handler.reference_insertion.class property */
  EVENTHANDLER_REFERENCEINSERTION: 'event_handler.reference_insertion.class',

  /** The event_handler.method_exception.class property */
  EVENTHANDLER_METHODEXCEPTION: 'event_handler.method_exception.class',

  /** The event_handler.include.class property */
  EVENTHANDLER_INCLUDE: 'event_handler.include.class',

  /** The event_handler.invalid_references.class property */
  EVENTHANDLER_INVALIDREFERENCES: 'event_handler.invalid_references.class',

  /** If invalid quiet references trigger events */
  EVENTHANDLER_INVALIDREFERENCES_QUIET: 'event_handler.invalid_references.quiet',

  /** If invalid null references trigger events */
  EVENTHANDLER_INVALIDREFERENCES_NULL: 'event_handler.invalid_references.null',

  /** If invalid tested references trigger events */
  EVENTHANDLER_INVALIDREFERENCES_TESTED: 'event_handler.invalid_references.tested',

  /*
   * ----------------------------------------------------------------------
   * V E L O C I M A C R O  C O N F I G U R A T I O N
   * ----------------------------------------------------------------------
   */

  /** Filename of local Velocimacro library template. */
  VM_LIBRARY: 'velocimacro.library.path',

  /** Default Velocimacro library template. */
  VM_LIBRARY_DEFAULT: 'velocimacros.vtl',

  /** switch for autoloading library-sourced VMs (for development). */
  VM_LIBRARY_AUTORELOAD: 'velocimacro.library.autoreload',

  /** boolean default true: allow inline (in-template) macro definitions. */
  VM_PERM_ALLOW_INLINE: 'velocimacro.inline.allow',

  /** boolean default false: allow inline macros to replace existing. */
  VM_PERM_ALLOW_INLINE_REPLACE_GLOBAL: 'velocimacro.inline.replace_global',

  /** Switch for forcing inline macros to be local: default false. */
  VM_PERM_INLINE_LOCAL: 'velocimacro.inline.local_scope',

  /** if true, throw an exception for wrong number of arguments */
  VM_ARGUMENTS_STRICT: 'velocimacro.arguments.strict',

  /** Enable 1.7 backward compatible mode for velocimacros */
  VM_ENABLE_BC_MODE: 'velocimacro.enable_bc_mode',

  /** Specify the maximum depth for macro calls */
  VM_MAX_DEPTH: 'velocimacro.max_depth',

  /** Defines name of the reference for block macro calls. */
  VM_BODY_REFERENCE: 'velocimacro.body_reference',

  /*
   * ----------------------------------------------------------------------
   * S T R I C T   M O D E  B E H A V I O U R
   * ----------------------------------------------------------------------
   */

  /** Properties referenced in the template are required to exist */
  RUNTIME_REFERENCES_STRICT: 'runtime.strict_mode.enable',

  /** Indicates we are going to use modified escape behavior in strict mode */
  RUNTIME_REFERENCES_STRICT_ESCAPE: 'runtime.strict_mode.escape',

  /*
   * ----------------------------------------------------------------------
   * I N T R O S P E C T I O N  C O N F I G U R A T I O N
   * ----------------------------------------------------------------------
   */

  /** key name for uberspector. Multiple classnames can be specified */
  UBERSPECT_CLASSNAME: 'introspector.uberspect.class',

  /** A comma separated list of packages to restrict access to */
  INTROSPECTOR_RESTRICT_PACKAGES: 'introspector.restrict.packages',

  /** A comma separated list of classes to restrict access to */
  INTROSPECTOR_RESTRICT_CLASSES: 'introspector.restrict.classes',

  /** key for Conversion Manager class */
  CONVERSION_HANDLER_CLASS: 'introspector.conversion_handler.class',

  /** key for Conversion Manager instance */
  CONVERSION_HANDLER_INSTANCE: 'introspector.conversion_handler.instance',

  /*
   * ----------------------------------------------------------------------
   * P A R S E R  C O N F I G U R A T I O N
   * ----------------------------------------------------------------------
   */

  /** Property specifying the parser class to use */
  PARSER_CLASS: 'parser.class',

  /** Default parser class */
  DEFAULT_PARSER_CLASS: 'org.apache.velocity.runtime.parser.StandardParser',

  /** The parser.pool.class property */
  PARSER_POOL_CLASS: 'parser.pool.class',

  /** Parser pool size */
  PARSER_POOL_SIZE: 'parser.pool.size',

  /** Allow hyphen in identifiers (backward compatibility option) */
  PARSER_HYPHEN_ALLOWED: 'parser.allow_hyphen_in_identifiers',

  /*
   * ----------------------------------------------------------------------
   * G E N E R A L  R U N T I M E  C O N F I G U R A T I O N
   * ----------------------------------------------------------------------
   */

  /** Whether to use string interning. */
  RUNTIME_STRING_INTERNING: 'runtime.string_interning',

  /** Switch for the interpolation facility for string literals. */
  INTERPOLATE_STRINGLITERALS: 'runtime.interpolate_string_literals',

  /** Switch for the immutability of integer ranges. */
  IMMUTABLE_RANGES: 'runtime.immutable_ranges',

  /** Switch for ignoring nulls in math equations vs throwing exceptions. */
  STRICT_MATH: 'runtime.strict_math',

  /** Key upon which a context should be accessible within itself */
  CONTEXT_AUTOREFERENCE_KEY: 'context.self_reference_key',

  /** Space gobbling mode */
  SPACE_GOBBLING: 'parser.space_gobbling',

  /*
   * ----------------------------------------------------------------------
   * Internal constants
   * ----------------------------------------------------------------------
   */

  /** Default Runtime properties. */
  DEFAULT_RUNTIME_PROPERTIES: 'org/apache/velocity/runtime/defaults/velocity.properties',

  /** Default Runtime directives. */
  DEFAULT_RUNTIME_DIRECTIVES: 'org/apache/velocity/runtime/defaults/directive.properties',

  /** externally provided logger name. */
  DEFAULT_RUNTIME_LOG_NAME: 'org.apache.velocity',

  /** token used to identify the loader internally. */
  RESOURCE_LOADER_IDENTIFIER: '_RESOURCE_LOADER_IDENTIFIER_',

  /** The default number of parser instances to create */
  NUMBER_OF_PARSERS: 20
} as const;

/**
 * Type for runtime property values
 */
export type RuntimeProperty = typeof RuntimeConstants[keyof typeof RuntimeConstants];
