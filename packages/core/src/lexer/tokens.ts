/** AWS-SPEC: Lexer Tokens | OWNER: vela | STATUS: READY */

import { createToken, TokenType, Lexer } from 'chevrotain';

// APIGW:Lexer Tokens
// Category for any token that can be treated as plain template text
export const AnyTextFragment = createToken({ name: 'AnyTextFragment', pattern: Lexer.NA });

// Literals
export const StringLiteral = createToken({
  name: 'StringLiteral',
  // Allow '$' chars inside quoted strings in expressions (quoted strings are literals in Velocity)
  pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/,
  categories: [AnyTextFragment],
});

export const NumberLiteral = createToken({
  name: 'NumberLiteral',
  pattern: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/,
  categories: [AnyTextFragment],
});

export const BooleanLiteral = createToken({
  name: 'BooleanLiteral',
  pattern: /\b(true|false)\b/,
  categories: [AnyTextFragment],
});

export const NullLiteral = createToken({
  name: 'NullLiteral',
  pattern: /\bnull\b/,
  categories: [AnyTextFragment],
});

// Identifiers and references
export const Identifier = createToken({
  name: 'Identifier',
  // Custom matcher to avoid swallowing a trailing underscore that is immediately
  // followed by a new interpolation (e.g., "$elem.id_$elem.secret"), so that
  // the '_' remains part of template text.
  pattern: {
    exec: (text: string, start: number) => {
      const len = text.length;
      if (start >= len) return null;
      const c0 = text.charCodeAt(start);
      const isAlpha = (c: number) => (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95;
      const isAlnum = (c: number) => (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95;
      if (!isAlpha(c0)) return null;
      let i = start + 1;
      while (i < len && isAlnum(text.charCodeAt(i))) i++;
      // If the last consumed char is '_' and the next char starts an interpolation ($),
      // drop the trailing underscore from the identifier so '_' stays as text.
      if (i > start + 1 && text.charCodeAt(i - 1) === 95 /* '_' */ && text.charCodeAt(i) === 36 /* '$' */) {
        i--; 
      }
      const image = text.slice(start, i);
      const matched = [image] as unknown as RegExpExecArray;
      matched.index = start;
      matched.input = text;
      return matched;
    }
  },
  line_breaks: false,
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
export const InKeyword = createToken({
  name: 'InKeyword',
  pattern: /\s+in\s+/,
  line_breaks: false,
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

});

export const RParen = createToken({
  name: 'RParen',
  pattern: /\)/,

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
  categories: [AnyTextFragment],
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
  // Allow '/' to be treated as plain text when not in an expression
  categories: [AnyTextFragment],
});

export const Mod = createToken({
  name: 'Mod',
  pattern: /%/,

});

export const Question = createToken({
  name: 'Question',
  pattern: /\?/,

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

export const Range = createToken({
  name: 'Range',
  pattern: /\.\./,
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

export const EndDirective = createToken({
  name: 'EndDirective',
  pattern: /#end\b/,
});

// Note: a generic Directive token is unnecessary when using specific ones

// Comments
export const LineComment = createToken({
  name: 'LineComment',
  pattern: /##.*/,
  line_breaks: true,
});

export const BlockComment = createToken({
  name: 'BlockComment',
  pattern: /#\*[\s\S]*?\*#/,
  line_breaks: true,
});

// Template text token (custom pattern): consume until next '#' or '$'
// but DO NOT start immediately after code-leading characters.
export const TemplateText = createToken({
  name: 'TemplateText',
  pattern: {
    exec: (text: string, startOffset: number) => {
      const len = text.length;
      if (startOffset >= len) return null;

      // current char cannot start with '#', '$', or newline
      // Quotes are allowed in template text unless they appear in an expression context
      const c0 = text.charCodeAt(startOffset);
      if (c0 === 35 /*#*/ || c0 === 36 /*$*/ || c0 === 10 /*\n*/ || c0 === 13 /*\r*/) return null;
      if (c0 === 34 /*"*/ || c0 === 39 /*'*/) {
        // Look back for previous non-space; if it's a code-leading char, treat as StringLiteral (not TemplateText)
        let k = startOffset - 1;
        while (k >= 0) {
          const pc = text.charCodeAt(k);
          if (pc !== 32 /*space*/ && pc !== 9 /*tab*/) break;
          k--;
        }
        if (k >= 0) {
          const prev = text.charCodeAt(k);
          const isCodeLead = (code: number) => (
            code === 40 /*(*/ || code === 61 /*=*/ || code === 58 /*:*/ ||
            code === 44 /*,*/ || code === 91 /*[*/ || code === 123 /*{*/
          );
          if (isCodeLead(prev)) return null;
        }
      }

      // If starting on spaces/tabs, allow TemplateText only when the next non-space
      // character is not an operator/bracket typical of expression context. This means
      // we preserve spaces in normal text (e.g., " Request:") but do not swallow
      // spaces inside directive expressions like "1.5 < 2.0" where next non-space is '<'.
      if (c0 === 32 /*space*/ || c0 === 9 /*tab*/) {
        let j = startOffset;
        while (j < len) {
          const ch = text.charCodeAt(j);
          if (ch !== 32 && ch !== 9) break;
        	  j++;
        }
        const next = j < len ? text.charCodeAt(j) : -1;
        // Block when next non-space looks like expression context
        const isOp = (code: number) => (
          code === 35 /*#*/ ||
          code === 60 /*<*/ || code === 62 /*>*/ || code === 61 /*=*/ ||
          code === 43 /*+*/ || code === 45 /*-*/ || code === 42 /**/ || code === 47 /*/*/ ||
          code === 37 /*%*/ || code === 38 /*&*/ || code === 124 /*|*/ ||
          code === 41 /*)*/ || code === 93 /*]*/ || code === 125 /*}*/ ||
          code === 44 /*,*/ || code === 58 /*:*/
        );
        if (next !== -1 && isOp(next)) return null;
      }

      // do not start if previous char is a code-leading character
      if (startOffset > 0) {
        const p = text.charCodeAt(startOffset - 1);
        // # $ . ( [ { ! = < > + - * / % ? : & | ,
        if (p===35||p===36||p===46||p===40||p===91||p===123||p===33||p===61||p===60||p===62||p===43||p===45||p===42||p===47||p===37||p===63||p===58||p===38||p===124||p===44) {
          return null;
        }
      }

      // scan forward until next '#', '$', '=', newline, or structural characters
      let i = startOffset;
      while (i < len) {
        const ch = text.charCodeAt(i);
        // Stop at: # $ = newline , [ ] ( ) { } 
        if (ch === 35 || ch === 36 || ch === 61 || ch === 10 || ch === 13 || 
            ch === 44 || ch === 91 || ch === 93 || ch === 40 || ch === 41 || 
            ch === 123 || ch === 125) break;
        i++;
      }
      
      // Preserve spaces as part of template text to maintain formatting between interpolations
      if (i === startOffset) return null;

      const image = text.slice(startOffset, i);
      const matched = [image] as unknown as RegExpExecArray;
      matched.index = startOffset;
      matched.input = text;
      return matched;
    }
  },
  categories: [AnyTextFragment],
  line_breaks: false,
});

// Whitespace and text
export const Whitespace = createToken({
  name: 'Whitespace',
  pattern: /[ \t]+/,
  group: Lexer.SKIPPED,
});

export const Newline = createToken({
  name: 'Newline',
  pattern: /\r?\n/,
  line_breaks: true,
  categories: [AnyTextFragment],
});

// Token list in proper order (longer before shorter, keywords before Identifier)
export const allTokens: TokenType[] = [
  // Comments first (highest priority)
  LineComment,
  BlockComment,

  // Keywords must come very early to avoid conflicts with identifiers
  InKeyword,


  // Interpolation must win before other '$' tokens
  InterpStart,

  // Individual directive tokens
  IfDirective,
  ElseIfDirective,
  ElseDirective,
  SetDirective,
  ForEachDirective,
  BreakDirective,
  StopDirective,
  MacroDirective,
  EndDirective,

  // References
  QuietRef,
  DollarRef,

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

  // Template text must come after all other tokens to avoid conflicts
  TemplateText,

  // String literals (placed after TemplateText so quoted text in templates is not consumed as literals)
  StringLiteral,

  // Identifiers (after keywords)
  Identifier,

  // Whitespace and categories
  Whitespace,
  Newline,
  AnyTextFragment,
];

// Create the lexer
export const createLexer = () => {
  return new Lexer(allTokens);
};

/* Deviation Report: None - Token definitions match AWS API Gateway VTL specification */
