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

let expression: Parser<AST.AST> =
    Parser.error("expression parser used before definition")

let args = expression.bind(arg =>
    Parser.zeroOrMore(COMMA.and(expression)).bind(args =>
        Parser.constant([arg, ...args])
    )
).or(Parser.constant([]))

let call: Parser<AST.AST> = ID.bind(callee =>
    LEFT_PAREN.and(
        args.bind(args =>
            RIGHT_PAREN.and(Parser.constant(new AST.CallNode(callee, args)))
        )
    )
)

let atom: Parser<AST.AST> =
    call
        .or(id)
        .or(NUMBER)
        .or(
            LEFT_PAREN
                .and(expression)
                .bind(e => RIGHT_PAREN.and(Parser.constant(e))))

let unary: Parser<AST.AST> =
    Parser.mayBe(NOT).bind(not =>
        atom.map(term => not ? new AST.NotNode(term) : term))

let infix = (
    operatorParser: Parser<new (left: AST.AST, right: AST.AST) => AST.AST>,
    termParser: Parser<AST.AST>
) =>
    termParser.bind(term =>
        Parser.zeroOrMore(operatorParser.bind(operator =>
            termParser.bind(term => Parser.constant({ operator, term }))
        )
        ).map(operatorTerms =>
            operatorTerms.reduce((left, { operator, term }) =>
                new operator(left, term), term))
    )

let product: Parser<AST.AST> = infix(STAR.or(SLASH), unary)
let sum: Parser<AST.AST> = infix(PLUS.or(MINUS), product)
let comparison: Parser<AST.AST> = infix(EQUAL.or(NOT_EQUAL), sum)

expression.parse = comparison.parse