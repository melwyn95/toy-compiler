import * as AST from "./ast"
import * as T from "./types"
import { VoidType } from "./types"

function assertType(expected: T.Type, got: T.Type): void {
    if (!expected.equals(got)) {
        throw TypeError(`Expected ${expected}, but got ${got}`)
    }
}

export class TypeChecker implements AST.Visitor<T.Type> {
    static empty = () => new TypeChecker(new Map(), new Map([
        ["putchar",
            new T.FunctionType(
                new Map([["x", new T.NumberType()]]),
                new T.VoidType()
            )
        ]
    ]), null)

    constructor(
        public locals: Map<string, T.Type>,
        public functions: Map<string, T.FunctionType>,
        public currentFunctionReturnType: T.Type | null
    ) { }

    visitNumberNode(_: AST.NumberNode): T.Type {
        return new T.NumberType()
    }
    visitIdNode(node: AST.IdNode): T.Type {
        let type = this.locals.get(node.value)
        if (!type) {
            throw TypeError(`Undefined variable ${node.value}`)
        }
        return type
    }
    visitNotNode(node: AST.NotNode): T.Type {
        assertType(new T.BooleanType(), node.term.visit(this))
        return new T.BooleanType()
    }
    visitIfNode(node: AST.IfNode): T.Type {
        node.conditional.visit(this)
        node.consequence.visit(this)
        node.alternative.visit(this)
        return new T.VoidType()
    }
    visitBlockNode(node: AST.BlockNode): T.Type {
        node.statements.forEach(s => s.visit(this))
        return new T.VoidType()
    }
    visitReturnNode(node: AST.ReturnNode): T.Type {
        let type = node.term.visit(this)
        if (this.currentFunctionReturnType) {
            assertType(this.currentFunctionReturnType, type)
            return new VoidType()
        } else {
            throw TypeError(`Encountered return statement outside any function`)
        }
    }
    visitCallNode(node: AST.CallNode): T.Type {
        let expected = this.functions.get(node.callee)
        if (!expected) {
            throw TypeError(`Function ${node.callee} is not defined`)
        }
        let argsTypes = new Map()
        node.args.forEach((arg, i) => {
            argsTypes.set(`x${i}`, arg.visit(this))
        })
        let got = new T.FunctionType(argsTypes, expected.returnType)
        assertType(expected, got)
        return expected.returnType
    }
    visitDivNode(node: AST.DivNode): T.Type {
        assertType(new T.NumberType(), node.left.visit(this))
        assertType(new T.NumberType(), node.right.visit(this))
        return new T.NumberType()
    }
    visitMulNode(node: AST.MulNode): T.Type {
        assertType(new T.NumberType(), node.left.visit(this))
        assertType(new T.NumberType(), node.right.visit(this))
        return new T.NumberType()
    }
    visitSubNode(node: AST.SubNode): T.Type {
        assertType(new T.NumberType(), node.left.visit(this))
        assertType(new T.NumberType(), node.right.visit(this))
        return new T.NumberType()
    }
    visitAddNode(node: AST.AddNode): T.Type {
        assertType(new T.NumberType(), node.left.visit(this))
        assertType(new T.NumberType(), node.right.visit(this))
        return new T.NumberType()
    }
    visitEqualsNode(node: AST.EqualsNode): T.Type {
        assertType(node.left.visit(this), node.right.visit(this))
        return new T.BooleanType()
    }
    visitNotEqualsNode(node: AST.NotEqualsNode): T.Type {
        assertType(node.left.visit(this), node.right.visit(this))
        return new T.BooleanType()
    }
    visitWhileNode(node: AST.WhileNode): T.Type {
        node.conditional.visit(this)
        node.body.visit(this)
        return new T.VoidType()
    }
    visitAssignNode(node: AST.AssignNode): T.Type {
        let variableType = this.locals.get(node.name)
        if (!variableType) {
            throw TypeError(`Assignment to an undefined variable ${node.name}`)
        }
        let valueType = node.value.visit(this)
        assertType(variableType, valueType)
        return new T.VoidType()
    }
    visitVarNode(node: AST.VarNode): T.Type {
        let type = node.value.visit(this)
        this.locals.set(node.name, type)
        return new T.VoidType()
    }
    visitFunctionNode(node: AST.FunctionNode): T.Type {
        this.functions.set(node.name, node.signature)
        let visitor = new TypeChecker(
            new Map(node.signature.parameters),
            this.functions,
            node.signature.returnType
        )
        node.body.visit(visitor)
        return new T.VoidType()
    }
    visitBoolean(_: AST.Boolean): T.Type {
        return new T.BooleanType()
    }
    visitUndefined(_: AST.Undefined): T.Type {
        return new T.VoidType()
    }
    visitNull(_: AST.Null): T.Type {
        return new T.NullType()
    }
    visitArrayLiteral(node: AST.ArrayLiteral): T.Type {
        if (node.elements.length === 0) {
            throw TypeError(`Can't infer type of an empty array`)
        }
        let argsTypes = node.elements.map(arg => arg.visit(this))
        let elementType = argsTypes.reduce((prev, next) => {
            assertType(prev, next)
            return prev
        })
        return new T.ArrayType(elementType)
    }
    visitArrayLookup(node: AST.ArrayLookup): T.Type {
        assertType(new T.NumberType(), node.index.visit(this))
        let type = node.array.visit(this)
        if (type instanceof T.ArrayType) {
            return type.element
        } else {
            throw TypeError(`Expected an array, but got ${type}`)
        }
    }
    visitLength(node: AST.Length): T.Type {
        let type = node.array.visit(this)
        if (type instanceof T.ArrayType) {
            return new T.NumberType()
        } else {
            throw TypeError(`Expected an array, but got ${type}`)
        }
    }
}