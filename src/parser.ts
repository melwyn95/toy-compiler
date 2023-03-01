import * as AST from "./ast"
import { Parser } from "./parser-combinators"

// TODO: read about commit messages feat:, fix:, refactor:, etc.    

let whitespace = Parser.regexp(/[ \n\r\t]+/y)
let comments = Parser.regexp(/[/][/].*/y).or(Parser.regexp(/[/][*].*[*][/]/sy))
let ignore = Parser.zeroOrMore(whitespace.or(comments))

let token = (pattern: RegExp) =>
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
let ASSIGN = token(/=/y).map(_ => AST.AssignNode)

// Expression
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
            RIGHT_PAREN.and(
                Parser.constant(
                    callee === "assert"
                        ? new AST.Assert(args[0])
                        : new AST.CallNode(callee, args)))
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

// Statement
let statement: Parser<AST.AST> =
    Parser.error("statement parser used before definition")

let returnStatement: Parser<AST.AST> =
    RETURN.and(expression).bind(term =>
        SEMICOLON.and(Parser.constant(new AST.ReturnNode(term))))

let expressionStatement: Parser<AST.AST> =
    expression.bind(term => SEMICOLON.and(Parser.constant(term)))

let ifStatement: Parser<AST.AST> =
    IF.and(LEFT_PAREN).and(expression).bind(conditional =>
        RIGHT_PAREN.and(statement).bind(consequence =>
            ELSE.and(statement).bind(alternative =>
                Parser.constant(
                    new AST.IfNode(conditional, consequence, alternative)
                )
            )
        )
    )

let whileStatement: Parser<AST.AST> =
    WHILE.and(LEFT_PAREN).and(expression).bind(conditional =>
        RIGHT_PAREN.and(statement).bind(body =>
            Parser.constant(new AST.WhileNode(conditional, body))
        )
    )

let varStatement: Parser<AST.AST> =
    VAR.and(ID).bind(name =>
        ASSIGN.and(expression).bind(value =>
            SEMICOLON.and(Parser.constant(new AST.VarNode(name, value)))
        )
    )

let assignmentStatement: Parser<AST.AST> =
    ID.bind(name =>
        ASSIGN.and(expression).bind(value =>
            SEMICOLON.and(Parser.constant(new AST.AssignNode(name, value)))
        )
    )

let blockStatement: Parser<AST.AST> =
    LEFT_BRACE.and(Parser.zeroOrMore(statement)).bind(statements =>
        RIGHT_BRACE.and(Parser.constant(new AST.BlockNode(statements)))
    )

let parameters: Parser<Array<string>> =
    ID.bind(param =>
        Parser.zeroOrMore(COMMA.and(ID)).bind(params =>
            Parser.constant([param, ...params])
        )
    ).or(Parser.constant([]))

let functionStatement: Parser<AST.AST> =
    FUNCTION.and(ID).bind(name =>
        LEFT_PAREN.and(parameters).bind(parameters =>
            RIGHT_PAREN.and(blockStatement).bind(block =>
                Parser.constant(
                    name === "main"
                        ? new AST.Main((block as AST.BlockNode).statements)
                        : new AST.FunctionNode(name, parameters, block))
            )
        )
    )

let statementParser: Parser<AST.AST> =
    returnStatement
        .or(ifStatement)
        .or(whileStatement)
        .or(varStatement)
        .or(assignmentStatement)
        .or(blockStatement)
        .or(functionStatement)
        .or(expressionStatement)

statement.parse = statementParser.parse

let parser: Parser<AST.AST> =
    ignore
        .and(Parser.zeroOrMore(statement))
        .map(statements => new AST.BlockNode(statements))

// Integration Test
let source = `
  function factorial(n) {
    var result = 1;
    while (n != 1) {
        result = result * n;
        n = n - 1;
    }
    return result;
  }
`

let got = parser.parseStringToCompletion(source)
let expected = new AST.BlockNode([
    new AST.FunctionNode("factorial", ["n"], new AST.BlockNode([
        new AST.VarNode("result", new AST.NumberNode(1)),
        new AST.WhileNode(
            new AST.NotEqualsNode(
                new AST.IdNode("n"),
                new AST.NumberNode(1)
            ),
            new AST.BlockNode([
                new AST.AssignNode("result",
                    new AST.MulNode(
                        new AST.IdNode("result"),
                        new AST.IdNode("n"))
                ),
                new AST.AssignNode("n",
                    new AST.SubNode(new AST.IdNode("n"),
                        new AST.NumberNode(1)
                    )
                )
            ])),
        new AST.ReturnNode(new AST.IdNode("result"))
    ]))
])

console.assert(got.equals(expected))

// Test main & assert
parser.parseStringToCompletion(`
    function main() {
        assert(1);
        assert(0);
        assert(!0);
    }
`).emit()
