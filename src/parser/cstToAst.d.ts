/** Apache Velocity: CST to AST Mapper | OWNER: vela | STATUS: READY */
import { CstNode } from 'chevrotain';
import { Template } from './ast.js';
export declare function cstToAst(cst: CstNode): Template;
