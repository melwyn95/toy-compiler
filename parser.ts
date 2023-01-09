import * as AST from "./ast"
import { Parser, Source } from "./parser-combinators"

// TODO: read about commit messages feat:, fix:, refactor:, etc.    

let whitespace = Parser.regexp(/[ \n\r\t]+/y)
let comments = Parser.regexp(/[/][/].*/y).or(Parser.regexp(/[/][*].*[*][/]/sy))
let ignore = Parser.zeroOrMore(whitespace.or(comments))

let token = pattern =>
    Parser.regexp(pattern).bind(value =>
        ignore.and(Parser.constant(value))
    )

// Keywords
let FUNCTION = token(/function\b/y)
let IF = token(/if\b/y)
let ELSE = token(/else\b/y)
let RETURN = token(/return\b/y)
let VAR = token(/var\b/y)
let WHILE = token(/while\b/y)

// Punctuations
let COMMA = token(/[,]/y)
let SEMICOLON = token(/;/y)
let LEFT_PAREN = token(/[(]/y)
let RIGHT_PAREN = token(/[)]/y)
let LEFT_BRACE = token(/[{]/y)
let RIGHT_BRACE = token(/[}]/y)

let NUMBER =
    token(/[0-9]+/y).map(digits => new AST.NumberNode(parseInt(digits)))

let ID = token(/[a-zA-Z_][a-zA-Z0-9_]*/y)
let id = ID.map(x => new AST.IdNode(x))

// Operators
let NOT = token(/!/y).map(_ => AST.NotNode)
let EQUAL = token(/==/y).map(_ => AST.EqualsNode)
let NOT_EQUAL = token(/!=/y).map(_ => AST.NotEqualsNode)
let PLUS = token(/[+]/y).map(_ => AST.AddNode)
let MINUS = token(/[-]/y).map(_ => AST.SubNode)
let STAR = token(/[*]/y).map(_ => AST.MulNode)
let SLASH = token(/[/]/y).map(_ => AST.DivNode)

