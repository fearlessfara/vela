/** Apache Velocity: Lexer Tokens | OWNER: vela | STATUS: READY */

import { createToken, TokenType, Lexer } from 'chevrotain';
// Category for any token that can be treated as plain template text
// This includes TemplateText, Whitespace, and also NumberLiteral/Identifier when in text context
export const AnyTextFragment = createToken({ name: 'AnyTextFragment', pattern: Lexer.NA });

// Literals
// String literals: double-quoted or single-quoted
// Double-quoted: "..." with escaped quotes and backslashes
// Single-quoted: '...' with escaped quotes and backslashes
// Note: Single-quoted strings can contain unescaped double quotes, and vice versa
export const StringLiteral = createToken({
  name: 'StringLiteral',
  pattern: {
    exec: (text: string, startOffset: number) => {
      const len = text.length;
      if (startOffset >= len) return null;
      
      const startChar = text.charCodeAt(startOffset);
      const isDouble = startChar === 34; // "
      const isSingle = startChar === 39; // '
      
      if (!isDouble && !isSingle) return null;
      
      const quoteChar = isDouble ? '"' : "'";
      let i = startOffset + 1;
      let hasLineBreaks = false;
      
      while (i < len) {
        const ch = text[i];
        if (ch === '\\') {
          // Escape sequence - skip next character
          i += 2;
          continue;
        }
        if (ch === quoteChar) {
          // Found closing quote
          i++;
          break;
        }
        // Check for line breaks in string
        if (ch === '\n' || ch === '\r') {
          hasLineBreaks = true;
        }
        i++;
      }
      
      if (i > startOffset + 1) {
        const image = text.slice(startOffset, i);
        const matched = [image] as unknown as RegExpExecArray;
        matched.index = startOffset;
        matched.input = text;
        (matched as any).hasLineBreaks = hasLineBreaks;
        return matched;
      }
      return null;
    }
  },
  line_breaks: true, // Strings can contain line breaks
});

export const NumberLiteral = createToken({
  name: 'NumberLiteral',
  pattern: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/,
  categories: [AnyTextFragment], // Can be part of text when not in expression context
});

export const BooleanLiteral = createToken({
  name: 'BooleanLiteral',
  pattern: /\b(true|false)\b/,
  categories: [AnyTextFragment], // Can be part of text when not in expression context
});

export const NullLiteral = createToken({
  name: 'NullLiteral',
  pattern: /\bnull\b/,
});

// Identifiers and references
export const Identifier = createToken({
  name: 'Identifier',
  pattern: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
  categories: [AnyTextFragment],
});

export const DollarRef = createToken({
  name: 'DollarRef',
  pattern: /\$[a-zA-Z_$][a-zA-Z0-9_$]*/,
});

export const QuietRef = createToken({
  name: 'QuietRef',
  pattern: /\$![a-zA-Z_$][a-zA-Z0-9_$]*/,
});

// Keywords
// Note: "in" keyword for #foreach is handled specially to avoid matching in regular text
// We match it as Identifier "in" between two whitespace/newline tokens in the foreach context
export const InKeyword = createToken({
  name: 'InKeyword',
  pattern: /\s+in\s+/,
  line_breaks: false,
  // Don't make this a category of AnyTextFragment to avoid breaking text like "text in middle"
});


// Interpolation
export const InterpStart = createToken({
  name: 'InterpStart',
  pattern: /\$\{/,
});


// Punctuation
export const LCurly = createToken({
  name: 'LCurly',
  pattern: /\{/,
  categories: [AnyTextFragment],
});

export const RCurly = createToken({
  name: 'RCurly',
  pattern: /\}/,
  categories: [AnyTextFragment],
});

export const LParen = createToken({
  name: 'LParen',
  pattern: /\(/,
  categories: [AnyTextFragment], // Can be part of text in template context
});

export const RParen = createToken({
  name: 'RParen',
  pattern: /\)/,
  categories: [AnyTextFragment], // Can be part of text in template context
});

export const LBracket = createToken({
  name: 'LBracket',
  pattern: /\[/,
  categories: [AnyTextFragment],
});

export const RBracket = createToken({
  name: 'RBracket',
  pattern: /\]/,
  categories: [AnyTextFragment],
});

export const Dot = createToken({
  name: 'Dot',
  pattern: /\./,
  categories: [AnyTextFragment], // Can be part of text in template context (e.g., "...")
});

export const Comma = createToken({
  name: 'Comma',
  pattern: /,/,
  categories: [AnyTextFragment],
});

export const Colon = createToken({
  name: 'Colon',
  pattern: /:/,
  categories: [AnyTextFragment],
});

export const Semicolon = createToken({
  name: 'Semicolon',
  pattern: /;/,
  categories: [AnyTextFragment], // Can be part of text in template context
});

// Operators
export const Assign = createToken({
  name: 'Assign',
  pattern: /=/,
  categories: [AnyTextFragment], // Can be part of text in template context (e.g., "a = b")
});

export const Plus = createToken({
  name: 'Plus',
  pattern: /\+/,
  categories: [AnyTextFragment], // Can be part of text in template context
});

export const Minus = createToken({
  name: 'Minus',
  pattern: /-/,
  categories: [AnyTextFragment], // Can be part of text in template context (e.g., "- item")
});

export const Star = createToken({
  name: 'Star',
  pattern: /\*/,
  categories: [AnyTextFragment], // Can be part of text in template context (e.g., "* item")
});

export const Slash = createToken({
  name: 'Slash',
  pattern: /\//,
  categories: [AnyTextFragment], // Can be part of text in template context (e.g., "and/or")
});

export const Mod = createToken({
  name: 'Mod',
  pattern: /%/,
  categories: [AnyTextFragment], // Can be part of text in template context (e.g., "50%")
});

export const Question = createToken({
  name: 'Question',
  pattern: /\?/,
  categories: [AnyTextFragment], // Can be part of text in template context (e.g., "Really?")
});

export const Not = createToken({
  name: 'Not',
  pattern: /!/,
  categories: [AnyTextFragment], // Can be part of text in template context
});

export const And = createToken({
  name: 'And',
  pattern: /&&/,
  categories: [AnyTextFragment], // Can be part of text in template context
});

export const Or = createToken({
  name: 'Or',
  pattern: /\|\|/,
  categories: [AnyTextFragment], // Can be part of text in template context
});

export const Eq = createToken({
  name: 'Eq',
  pattern: /==/,
  categories: [AnyTextFragment], // Can be part of text in template context
});

export const Ne = createToken({
  name: 'Ne',
  pattern: /!=/,
  categories: [AnyTextFragment], // Can be part of text in template context
});

export const Lt = createToken({
  name: 'Lt',
  pattern: /</,
  categories: [AnyTextFragment], // Can be part of text in template context (e.g., "< 5")
});

export const Le = createToken({
  name: 'Le',
  pattern: /<=/,
  categories: [AnyTextFragment], // Can be part of text in template context
});

export const Gt = createToken({
  name: 'Gt',
  pattern: />/,
  categories: [AnyTextFragment], // Can be part of text in template context (e.g., "> 5")
});

export const Ge = createToken({
  name: 'Ge',
  pattern: />=/,
  categories: [AnyTextFragment], // Can be part of text in template context
});

export const Range = createToken({
  name: 'Range',
  pattern: /\.\./,
});

// Escaped directives (must come before individual directive tokens)
// Matches patterns like \#end, \#if, \#set, etc.
// Pattern: optional double-escapes + backslash + # + directive name
export const EscapedDirective = createToken({
  name: 'EscapedDirective',
  pattern: /(?:\\\\)*\\#(?:if|elseif|else|end|set|foreach|break|stop|macro|evaluate|parse|include)\b/,
  line_breaks: false,
  categories: [AnyTextFragment], // Treat as text in template output
});

// Directives
export const Hash = createToken({
  name: 'Hash',
  pattern: /#/,
  // Treat stray '#' as text so it can appear inside template text segments.
  // Real directives/comments (#if, ##, #* *#) will still win due to earlier, longer tokens.
  categories: [AnyTextFragment],
});

// Individual directive tokens
export const IfDirective = createToken({
  name: 'IfDirective',
  pattern: /#if\b/,
});

export const ElseIfDirective = createToken({
  name: 'ElseIfDirective',
  pattern: /#elseif\b/,
});

export const ElseDirective = createToken({
  name: 'ElseDirective',
  pattern: /#else\b/,
});

export const SetDirective = createToken({
  name: 'SetDirective',
  pattern: /#set\b/,
});

export const ForEachDirective = createToken({
  name: 'ForEachDirective',
  pattern: /#foreach\b/,
});

export const BreakDirective = createToken({
  name: 'BreakDirective',
  pattern: /#break\b/,
});

export const StopDirective = createToken({
  name: 'StopDirective',
  pattern: /#stop\b/,
});

export const MacroDirective = createToken({
  name: 'MacroDirective',
  pattern: /#macro\b/,
});

export const EvaluateDirective = createToken({
  name: 'EvaluateDirective',
  pattern: /#evaluate\b/,
});

export const ParseDirective = createToken({
  name: 'ParseDirective',
  pattern: /#parse\b/,
});

export const IncludeDirective = createToken({
  name: 'IncludeDirective',
  pattern: /#include\b/,
});

export const EndDirective = createToken({
  name: 'EndDirective',
  pattern: /#end\b/,
});

// Note: a generic Directive token is unnecessary when using specific ones

// Comments - these should be SKIPPED (not included in output)
// Line comments: ## ... until end of line (INCLUDING the newline)
// Per Java Parser.jjt line 1126: SINGLE_LINE_COMMENT includes the newline
export const LineComment = createToken({
  name: 'LineComment',
  pattern: /##[^\r\n]*(\r\n|\r|\n)?/,
  line_breaks: true, // Changed to true since we consume the newline
  group: Lexer.SKIPPED, // Skip comments - they don't appear in output
});

// Block comments: #* ... *#
export const BlockComment = createToken({
  name: 'BlockComment',
  pattern: /#\*[\s\S]*?\*#/,
  line_breaks: true,
  group: Lexer.SKIPPED, // Skip comments - they don't appear in output
});

// Template text token (custom pattern): consume until next '#' or '$'
// but DO NOT start immediately after code-leading characters.
export const TemplateText = createToken({
  name: 'TemplateText',
  pattern: {
    exec: (text: string, startOffset: number) => {
      const len = text.length;
      if (startOffset >= len) return null;

      // current char cannot start with '#' or '$'
      // Also cannot start with space/tab since Whitespace token handles those
      // Newlines CAN start TemplateText since Newline token only matches actual newlines
      const c0 = text.charCodeAt(startOffset);
      if (c0 === 35 /*#*/ || c0 === 36 /*$*/ || c0 === 32 /* */ || c0 === 9 /*\t*/) return null;

      // Check if this is an escaped directive (e.g., \#end should be literal text)
      // If previous char is backslash, this might be escaped - but we still want to capture it as text
      if (startOffset > 0) {
        const p = text.charCodeAt(startOffset - 1);
        // If previous is backslash, the # or $ is escaped and should be part of text
        if (p === 92 /*\*/) {
          // This is escaped - include it in text (the backslash will be handled separately or included)
          // Actually, the backslash might have been consumed already, so we should start from before it
          // But for now, let's just allow TemplateText to start here
        } else {
          // Check if previous char was part of a variable reference (letter, digit, underscore, or $)
          const isAfterVarRef = (p >= 48 && p <= 57) || // 0-9
                                (p >= 65 && p <= 90) || // A-Z
                                (p >= 97 && p <= 122) || // a-z
                                p === 95 || // _
                                p === 36; // $
          // # $ . ( [ { ! = < > + - * / % ? : & | ,
          // Only block if it's a code-leading char AND not after a variable reference
          if (!isAfterVarRef && (p===35||p===36||p===46||p===40||p===91||p===123||p===33||p===61||p===60||p===62||p===43||p===45||p===42||p===47||p===37||p===63||p===58||p===38||p===124||p===44)) {
            return null;
          }
        }
      }

      // scan forward until next '#', '$', '=', '\', space, tab, or structural characters
      // Include newlines in the text but NOT spaces/tabs (Whitespace token handles those)
      // Note: Parentheses, brackets, and braces can be part of text, so we only stop
      // at them if they're immediately followed by something that looks like an expression
      let i = startOffset;
      while (i < len) {
        const ch = text.charCodeAt(i);
        // Stop at backslash if it precedes # (escaped directive pattern)
        if (ch === 92 /*\*/ && i + 1 < len) {
          const nextCh = text.charCodeAt(i + 1);
          if (nextCh === 35 /*#*/ || nextCh === 92 /*\*/) {
            // This might be start of escaped directive like \#end or \\#end
            // Let EscapedDirective token match instead
            break;
          }
        }
        // Always stop at: # $ space tab (but not newlines)
        // Note: Don't stop at = because it's valid in template text like "x = y"
        if (ch === 35 || ch === 36 || ch === 32 || ch === 9) break;
        
        // For [ ] ( ) { }, in text contexts these are usually part of the text
        // Only stop if they're followed by $ or # which clearly start expressions
        // Note: In VTL, expressions like ($foo) only appear in directive contexts like #if($foo)
        // In plain text, parentheses are just text characters
        if (ch === 91 || ch === 93 || ch === 40 || ch === 41 || ch === 123 || ch === 125) {
          // Check next character - only stop if it's $ or # (expression markers)
          if (i + 1 < len) {
            const nextCh = text.charCodeAt(i + 1);
            if (nextCh === 36 || nextCh === 35) { // $ or #
              // Might be start of expression - stop here
              break;
            }
            // Otherwise, include the paren/bracket/brace as text and continue
          }
          // Include this character (paren/bracket/brace) in the text
          // The loop will increment i and continue
        }
        // Stop at comma only if it's not followed by space (likely part of expression)
        if (ch === 44) { // comma
          // Check if next char is space - if so, include comma and space in text
          if (i + 1 < len && text.charCodeAt(i + 1) === 32) {
            // Include comma and space, then stop
            i += 2;
            break;
          } else {
            // Comma not followed by space, likely expression context
            break;
          }
        }
        i++;
      }
      
      // Don't trim trailing spaces - they're part of the template output
      if (i === startOffset) return null;

      const image = text.slice(startOffset, i);
      const matched = [image] as unknown as RegExpExecArray;
      matched.index = startOffset;
      matched.input = text;
      return matched;
    }
  },
  categories: [AnyTextFragment],
  line_breaks: true, // TemplateText can contain newlines
});

// Whitespace and text
// Note: Whitespace must be a token (not SKIPPED) for space gobbling
// It's in AnyTextFragment category AND explicitly consumed in directive rules
export const Whitespace = createToken({
  name: 'Whitespace',
  pattern: /[ \t]+/,
  categories: [AnyTextFragment],
});

// Newlines: treat as text fragments so they're included in template output
export const Newline = createToken({
  name: 'Newline',
  pattern: /\r?\n/,
  line_breaks: true,
  categories: [AnyTextFragment], // Treat as text in template contexts
});

// Token list in proper order (longer before shorter, keywords before Identifier)
export const allTokens: TokenType[] = [
  // Comments first (highest priority)
  LineComment,
  BlockComment,

  // Interpolation must win before other '$' tokens
  InterpStart,

  // Escaped directives must come before individual directive tokens
  EscapedDirective,

  // Individual directive tokens
  IfDirective,
  ElseIfDirective,
  ElseDirective,
  SetDirective,
  ForEachDirective,
  BreakDirective,
  StopDirective,
  MacroDirective,
  EvaluateDirective,
  ParseDirective,
  IncludeDirective,
  EndDirective,

  // References
  QuietRef,
  DollarRef,

  // String literals
  StringLiteral,

  // Numbers and booleans
  NumberLiteral,
  BooleanLiteral,
  NullLiteral,

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
  Question,
  Range,

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

  // Whitespace must come before TemplateText to match in directive/expression contexts
  // This ensures spaces in directives like "#set($x = 1)" are recognized as Whitespace tokens
  Whitespace,

  // Newline must also come before TemplateText
  Newline,

  // Template text must come after all other tokens to avoid conflicts
  // It will match remaining text that doesn't start with # or $
  TemplateText,

  // Identifiers (after keywords)
  Identifier,

  // InKeyword comes after TemplateText to avoid matching " in " in regular text
  // It will still match in directive/expression contexts where TemplateText doesn't apply
  InKeyword,

  // Category tokens
  AnyTextFragment,
];

// Create the lexer
export const createLexer = () => {
  return new Lexer(allTokens);
};

