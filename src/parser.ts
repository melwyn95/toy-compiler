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
let LEFT_BRACKET = token(/[\[]/y)
let RIGHT_BRACKET = token(/[\]]/y)

let NUMBER =
    token(/[0-9]+/y).map(digits => new AST.NumberNode(parseInt(digits)))

let CHAR_LITERAL =
    token(/'.'|'[\n\r\t]'/y).map(char => new AST.NumberNode(char.charCodeAt(1)))

let UNDEFINED =
    token(/undefined\b/y).map(_ => new AST.Undefined())

let NULL =
    token(/null\b/y).map(_ => new AST.Null())

let TRUE =
    token(/true\b/y).map(_ => new AST.Boolean(true))
let FALSE =
    token(/false\b/y).map(_ => new AST.Boolean(false))
let boolean: Parser<AST.AST> = TRUE.or(FALSE)

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

let scalar: Parser<AST.AST> =
    boolean
        .or(UNDEFINED)
        .or(NULL)
        .or(id)
        .or(NUMBER)
        .or(CHAR_LITERAL)

let call: Parser<AST.AST> = ID.bind(callee =>
    LEFT_PAREN.and(
        args.bind(args =>
            RIGHT_PAREN.and(
                Parser.constant(
                    callee === "length"
                        ? new AST.Length(args[0])
                        : new AST.CallNode(callee, args)))
        )
    )
)

let arrayLiteral: Parser<AST.AST> = LEFT_BRACKET.and(args).bind(args =>
    RIGHT_BRACKET.and(
        Parser.constant(
            new AST.ArrayLiteral(args)
        )
    )
)

let arrayLookup: Parser<AST.AST> = ID.bind(array =>
    LEFT_BRACKET.and(
        expression.bind(index =>
            RIGHT_BRACKET.and(
                Parser.constant(
                    new AST.ArrayLookup(new AST.IdNode(array), index)
                )
            )
        )
    )
)

let atom: Parser<AST.AST> =
    call
        .or(arrayLiteral)
        .or(arrayLookup)
        .or(scalar)
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
                    new AST.FunctionNode(name, parameters, block))
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
    function assert(x) {
        if (x) {
            putchar(46);
        } else {
            putchar(70);
        }
    }

    function assert1234(a, b, c, d) {
        assert(a == 1);
        assert(b == 2);
        assert(c == 3);
        assert(d == 4);
    }

    function main() {
        assert(1);
        assert(0);
        assert(!0);
        assert(42 == 4 + 2 * (12 - 2) + 3 * (5 + 1));
        {   /* Testing a Block */
            assert(0);
            assert(1);
        }
        putchar(97);
        putchar('A');
        putchar('R');
        putchar('M');
        assert(rand() != 42);

        if (1) {
            putchar('I');
        } else {
            putchar('E');
        }

        if (0) {
            putchar('I');
        } else {
            putchar('E');
        }
        putchar('\n');
        putchar('\t');
        putchar('H');
        putchar('\n');

        assert1234(1, 2, 3, 4);

        var x = 4 + 2 * (12 - 2);
        var y = 3 * (5 + 1);
        var z = x + y;
        assert(z == 42);

        var a = 1;
        assert(a == 1);
        a = 0;
        assert(a == 0);

        var i = 0;
        while(i != 3) {
            i = i + 1;
        }
        assert(i == 3);
    }
`)

// Test return & recursion
parser.parseStringToCompletion(`
    function assert(x) {
        if (x) {
            putchar(46);
        } else {
            putchar(70);
        }
    }

    function factorial(n) {
        if (n == 0) {
            return 1;
        } else {
            return n * factorial(n - 1);
        }
    }

    function main() {
        assert(1       == factorial(1));
        assert(1       == factorial(1));
        assert(2       == factorial(2));
        assert(6       == factorial(3));
        assert(24      == factorial(4));
        assert(120     == factorial(5));
        assert(720     == factorial(6));
        assert(5040    == factorial(7));
        assert(40320   == factorial(8));
        assert(362880  == factorial(9));
        assert(3628800 == factorial(10));
        return 0;
    }
`)

// Test assignment & while loop
parser.parseStringToCompletion(`
    function assert(x) {
        if (x) {
            putchar(46);
        } else {
            putchar(70);
        }
    }

    function factorial(n) {
        var result = 1;
        while(n != 0) {
            result = result * n;
            n = n - 1;
        }
        return result;
    }

    function main() {
        assert(1       == factorial(1));
        assert(1       == factorial(1));
        assert(2       == factorial(2));
        assert(6       == factorial(3));
        assert(24      == factorial(4));
        assert(120     == factorial(5));
        assert(720     == factorial(6));
        assert(5040    == factorial(7));
        assert(40320   == factorial(8));
        assert(362880  == factorial(9));
        assert(3628800 == factorial(10));
        return 0;
    }
`)

// Extended baseline languge
parser.parseStringToCompletion(`
    function assert(x) {
        if (x) {
            putchar(46);
        } else {
            putchar(70);
        }
    }

    function main() {
        assert(true);
        assert(false);
        assert(!undefined);
        assert(null);
        return 0;
    }
`)

// Extended baseline languge with Arrays
parser.parseStringToCompletion(`
    function assert(x) {
        if (x) {
            putchar(46);
        } else {
            putchar(70);
        }
    }

    function main() {
        var a = [10, 20, 30];
        assert(a[0] == 10);
        assert(a[1] == 20);
        assert(a[2] == 30);
        assert(a[3] == undefined); // Bounds checking.
        assert(length(a) == 3);
        return 0;
    }
`).emit(AST.Environment.empty())
