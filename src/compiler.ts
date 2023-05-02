import * as AST from "./ast"
import { parser } from "./parser"
import { CodeGenerator } from "./code-generator"

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

import * as fs from "fs"

let file = process.argv[2]

let contents = fs.readFileSync(file, "utf-8")

let ast = parser.parseStringToCompletion(contents)

ast.visit(CodeGenerator.empty())