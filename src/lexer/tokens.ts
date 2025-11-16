/** Apache Velocity: Lexer Tokens | OWNER: vela | STATUS: READY */

import { createToken, TokenType, Lexer } from 'chevrotain';
// Category for any token that can be treated as plain template text
export const AnyTextFragment = createToken({ name: 'AnyTextFragment', pattern: Lexer.NA });

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
  categories: [AnyTextFragment], // Can be part of text in template context
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

      // current char cannot start with '#' or '$' or newline
      const c0 = text.charCodeAt(startOffset);
      if (c0 === 35 /*#*/ || c0 === 36 /*$*/ || c0 === 10 /*\n*/ || c0 === 13 /*\r*/) return null;

      // do not start if previous char is a code-leading character
      // BUT: allow starting after variable references ($name, $!name) - check if previous was part of identifier
      if (startOffset > 0) {
        const p = text.charCodeAt(startOffset - 1);
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

      // scan forward until next '#', '$', '=', newline, or structural characters
      // Include spaces and tabs in the text (they're part of the template output)
      let i = startOffset;
      while (i < len) {
        const ch = text.charCodeAt(i);
        // Stop at: # $ = newline [ ] ( ) { }
        // Note: Don't stop at comma, !, or whitespace since they can be part of text
        // Comma is handled separately but we want to include spaces after it
        if (ch === 35 || ch === 36 || ch === 61 || ch === 10 || ch === 13 || 
            ch === 91 || ch === 93 || ch === 40 || ch === 41 || 
            ch === 123 || ch === 125) break;
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
  line_breaks: false,
});

// Whitespace and text
// Note: Whitespace is skippable in expression contexts but preserved in text
// We'll handle it specially - make it skippable for expressions, but TemplateText will capture it
export const Whitespace = createToken({
  name: 'Whitespace',
  pattern: /[ \t]+/,
  group: Lexer.SKIPPED, // Skip in expression contexts
  categories: [AnyTextFragment], // But can be part of text
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

  // Whitespace must come before TemplateText so it can be captured
  Whitespace,

  // Template text must come after all other tokens to avoid conflicts
  TemplateText,

  // Identifiers (after keywords)
  Identifier,

  // Newline and categories
  Newline,
  AnyTextFragment,
];

// Create the lexer
export const createLexer = () => {
  return new Lexer(allTokens);
};

