/** AWS-SPEC: Lexer Tokens | OWNER: vela | STATUS: READY */
import { createToken } from 'chevrotain';
// APIGW:Lexer Tokens
// Literals
export const StringLiteral = createToken({
    name: 'StringLiteral',
    pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/,
});
export const NumberLiteral = createToken({
    name: 'NumberLiteral',
    pattern: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/,
});
export const BooleanLiteral = createToken({
    name: 'BooleanLiteral',
    pattern: /\b(true|false)\b/,
});
export const NullLiteral = createToken({
    name: 'NullLiteral',
    pattern: /\bnull\b/,
});
// Identifiers and references
export const Identifier = createToken({
    name: 'Identifier',
    pattern: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
});
export const DollarRef = createToken({
    name: 'DollarRef',
    pattern: /\$[a-zA-Z_$][a-zA-Z0-9_$]*/,
});
export const QuietRef = createToken({
    name: 'QuietRef',
    pattern: /\$![a-zA-Z_$][a-zA-Z0-9_$]*/,
});
// Interpolation
export const InterpStart = createToken({
    name: 'InterpStart',
    pattern: /\$\{/,
});
export const InterpEnd = createToken({
    name: 'InterpEnd',
    pattern: /\}/,
});
// Punctuation
export const LCurly = createToken({
    name: 'LCurly',
    pattern: /\{/,
});
export const RCurly = createToken({
    name: 'RCurly',
    pattern: /\}/,
});
export const LParen = createToken({
    name: 'LParen',
    pattern: /\(/,
});
export const RParen = createToken({
    name: 'RParen',
    pattern: /\)/,
});
export const LBracket = createToken({
    name: 'LBracket',
    pattern: /\[/,
});
export const RBracket = createToken({
    name: 'RBracket',
    pattern: /\]/,
});
export const Dot = createToken({
    name: 'Dot',
    pattern: /\./,
});
export const Comma = createToken({
    name: 'Comma',
    pattern: /,/,
});
export const Colon = createToken({
    name: 'Colon',
    pattern: /:/,
});
export const Semicolon = createToken({
    name: 'Semicolon',
    pattern: /;/,
});
// Operators
export const Assign = createToken({
    name: 'Assign',
    pattern: /=/,
});
export const Plus = createToken({
    name: 'Plus',
    pattern: /\+/,
});
export const Minus = createToken({
    name: 'Minus',
    pattern: /-/,
});
export const Star = createToken({
    name: 'Star',
    pattern: /\*/,
});
export const Slash = createToken({
    name: 'Slash',
    pattern: /\//,
});
export const Mod = createToken({
    name: 'Mod',
    pattern: /%/,
});
export const Not = createToken({
    name: 'Not',
    pattern: /!/,
});
export const And = createToken({
    name: 'And',
    pattern: /&&/,
});
export const Or = createToken({
    name: 'Or',
    pattern: /\|\|/,
});
export const Eq = createToken({
    name: 'Eq',
    pattern: /==/,
});
export const Ne = createToken({
    name: 'Ne',
    pattern: /!=/,
});
export const Lt = createToken({
    name: 'Lt',
    pattern: /</,
});
export const Le = createToken({
    name: 'Le',
    pattern: /<=/,
});
export const Gt = createToken({
    name: 'Gt',
    pattern: />/,
});
export const Ge = createToken({
    name: 'Ge',
    pattern: />=/,
});
// Directives
export const Hash = createToken({
    name: 'Hash',
    pattern: /#/,
});
export const Directive = createToken({
    name: 'Directive',
    pattern: /#(?:if|elseif|else|set|foreach|break|stop|macro|parse|end|include)\b/,
});
// Comments
export const LineComment = createToken({
    name: 'LineComment',
    pattern: /##.*$/,
    line_breaks: true,
});
export const BlockComment = createToken({
    name: 'BlockComment',
    pattern: /#\*[\s\S]*?\*#/,
    line_breaks: true,
});
// Whitespace and text
export const Whitespace = createToken({
    name: 'Whitespace',
    pattern: /\s+/,
    group: 'whitespace',
});
export const Newline = createToken({
    name: 'Newline',
    pattern: /\r?\n/,
    group: 'whitespace',
    line_breaks: true,
});
export const Text = createToken({
    name: 'Text',
    pattern: /[^#$\r\n]+/,
});
// Token list in proper order (longer before shorter, keywords before Identifier)
export const allTokens = [
    // Comments first (highest priority)
    LineComment,
    BlockComment,
    // String literals
    StringLiteral,
    // Numbers and booleans
    NumberLiteral,
    BooleanLiteral,
    NullLiteral,
    // References (before identifiers)
    QuietRef,
    DollarRef,
    // Interpolation
    InterpStart,
    InterpEnd,
    // Directives (before hash)
    Directive,
    // Operators (longer first)
    Le,
    Ge,
    Eq,
    Ne,
    And,
    Or,
    // Single character operators
    Plus,
    Minus,
    Star,
    Slash,
    Mod,
    Not,
    Lt,
    Gt,
    Assign,
    // Punctuation
    LCurly,
    RCurly,
    LParen,
    RParen,
    LBracket,
    RBracket,
    Dot,
    Comma,
    Colon,
    Semicolon,
    Hash,
    // Identifiers (last)
    Identifier,
    // Whitespace and text (lowest priority)
    Whitespace,
    Newline,
    Text,
];
/* Deviation Report: None - Token definitions match AWS API Gateway VTL specification */
