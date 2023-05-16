import * as AST from "./ast"
import * as T from "./types"
import { CodeGenerator } from "./code-generator"
import { Parser } from "./parser-combinators"
import { NumberType } from "./types"

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
let ARRAY = token(/Array\b/y)

// Punctuations
let COMMA = token(/[,]/y)
let SEMICOLON = token(/;/y)
let LEFT_PAREN = token(/[(]/y)
let RIGHT_PAREN = token(/[)]/y)
let LEFT_BRACE = token(/[{]/y)
let RIGHT_BRACE = token(/[}]/y)
let LEFT_BRACKET = token(/[\[]/y)
let RIGHT_BRACKET = token(/[\]]/y)
let LESS_THAN = token(/[<]/y)
let GREATER_THAN = token(/[>]/y)
let COLON = token(/[:]/y)

let INTEGER =
    token(/[0-9]+/y).map(digits => new AST.NumberNode(parseInt(digits)))

let CHAR_LITERAL =
    token(/'.'|'\\n'|'\\t'/y).map(char =>
        char === "'\\n'"
            ? new AST.NumberNode(10)
            : char === "'\\t'"
                ? new AST.NumberNode(9)
                : new AST.NumberNode(char.charCodeAt(1)))

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

// Type
let VOID = token(/void/y).map(_ => new T.VoidType())
let BOOLEAN = token(/boolean/y).map(_ => new T.BooleanType())
let NUMBER = token(/number/y).map(_ => new T.NumberType())

let type: Parser<T.Type> = Parser.error("type parser used before definition")

let arrayType: Parser<T.Type> =
    ARRAY.and(LESS_THAN).and(type).bind(ty =>
        GREATER_THAN.and(Parser.constant(new T.ArrayType(ty))))

let atomType: Parser<T.Type> =
    VOID.or(BOOLEAN).or(NUMBER).or(arrayType)

type.parse = atomType.parse

let optionalTypeAnnotation: Parser<T.Type> =
    Parser.mayBe(COLON.and(type)).map(ty => ty ? ty : new T.NumberType())

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
        .or(INTEGER)
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

let parameter: Parser<[string, T.Type]> =
    ID.bind(parameter =>
        optionalTypeAnnotation.bind(type =>
            Parser.constant([parameter, type])))

let parameters: Parser<Array<[string, T.Type]>> =
    parameter.bind(param =>
        Parser.zeroOrMore(COMMA.and(parameter)).bind(params =>
            Parser.constant([param, ...params])
        )
    ).or(Parser.constant([]))

let functionStatement: Parser<AST.AST> =
    FUNCTION.and(ID).bind(name =>
        LEFT_PAREN.and(parameters).bind(parameters =>
            RIGHT_PAREN.and(optionalTypeAnnotation).bind(returnType =>
                blockStatement.bind(block =>
                    Parser.constant(
                        new AST.FunctionNode(
                            name,
                            new T.FunctionType(new Map(parameters), returnType),
                            block
                        )
                    )
                )
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

export let parser: Parser<AST.AST> =
    ignore
        .and(Parser.zeroOrMore(statement))
        .map(statements => new AST.BlockNode(statements))
