import * as T from "./types"

interface Visitor<T> {
    visitNumberNode(node: NumberNode): T;
    visitIdNode(node: IdNode): T;
    visitNotNode(node: NotNode): T;
    visitIfNode(node: IfNode): T;
    visitBlockNode(node: BlockNode): T;
    visitReturnNode(node: ReturnNode): T;
    visitCallNode(node: CallNode): T;
    visitDivNode(node: DivNode): T;
    visitMulNode(node: MulNode): T;
    visitSubNode(node: SubNode): T;
    visitAddNode(node: AddNode): T;
    visitEqualsNode(node: EqualsNode): T;
    visitNotEqualsNode(node: NotEqualsNode): T;
    visitWhileNode(node: WhileNode): T;
    visitAssignNode(node: AssignNode): T;
    visitVarNode(node: VarNode): T;
    visitFunctionNode(node: FunctionNode): T;

    visitBoolean(node: Boolean): T;
    visitUndefined(node: Undefined): T;
    visitNull(node: Null): T;

    visitArrayLiteral(node: ArrayLiteral): T;
    visitArrayLookup(node: ArrayLookup): T;
    visitLength(node: Length): T;

}

class Label {
    static counter = 0
    value: number

    constructor() {
        this.value = Label.counter++
    }

    toString() {
        return `.L${this.value}`
    }
}

interface AST {
    visit<T>(v: Visitor<T>): T;
    equals(node: AST): boolean;
}

/* AST Nodes */

// Number node
class NumberNode implements AST {
    constructor(public value: number) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitNumberNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof NumberNode
            && node.value === this.value
    }
}

// Identifier Node
class IdNode implements AST {
    constructor(public value: string) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitIdNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof IdNode
            && node.value === this.value
    }
}

// Not (!) operator Node
class NotNode implements AST {
    constructor(public term: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitNotNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof NotNode
            && this.term.equals(node.term)
    }
}

// Equals (==) operator Node
class EqualsNode implements AST {
    constructor(public left: AST, public right: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitEqualsNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof EqualsNode
            && this.left.equals(node.left)
            && this.right.equals(node.right)
    }
}

// NotEquals (!=) operator Node
class NotEqualsNode implements AST {
    constructor(public left: AST, public right: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitNotEqualsNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof NotEqualsNode
            && this.left.equals(node.left)
            && this.right.equals(node.right)
    }
}

// Add (+) operator Node
class AddNode implements AST {
    constructor(public left: AST, public right: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitAddNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof AddNode
            && this.left.equals(node.left)
            && this.right.equals(node.right)
    }
}

// Sub (-) operator Node
class SubNode implements AST {
    constructor(public left: AST, public right: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitSubNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof SubNode
            && this.left.equals(node.left)
            && this.right.equals(node.right)
    }
}

// Mul (*) operator Node
class MulNode implements AST {
    constructor(public left: AST, public right: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitMulNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof MulNode
            && this.left.equals(node.left)
            && this.right.equals(node.right)
    }
}

// Div (/) operator Node
class DivNode implements AST {
    constructor(public left: AST, public right: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitDivNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof DivNode
            && this.left.equals(node.left)
            && this.right.equals(node.right)
    }
}

// Function Call/Application Node
class CallNode implements AST {
    constructor(public callee: string, public args: Array<AST>) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitCallNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof CallNode
            && this.callee === node.callee
            && this.args.length === node.args.length
            && this.args.every((arg, i) => arg.equals(node.args[i]))
    }
}

// Return Node
class ReturnNode implements AST {
    constructor(public term: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitReturnNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof ReturnNode
            && this.term.equals(node.term)
    }
}

// Block Node
class BlockNode implements AST {
    constructor(public statements: Array<AST>) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitBlockNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof BlockNode
            && this.statements.length === node.statements.length
            && this.statements.every((stm, i) => stm.equals(node.statements[i]))
    }
}

// If-Else Node
class IfNode implements AST {
    constructor(public conditional: AST,
        public consequence: AST,
        public alternative: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitIfNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof IfNode
            && this.conditional.equals(node.conditional)
            && this.consequence.equals(node.consequence)
            && this.alternative.equals(node.alternative)
    }
}

// Function Definition Node
class FunctionNode implements AST {
    constructor(public name: string,
        public signature: T.FunctionType,
        public body: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitFunctionNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof FunctionNode
            && this.name === node.name
            && this.signature.equals(node.signature)
            && this.body.equals(node.body)
    }
}

// Variable Declaration Node
class VarNode implements AST {
    constructor(public name: string, public value: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitVarNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof VarNode
            && this.name === node.name
            && this.value.equals(node.value)
    }
}

// Assignment Node 
class AssignNode implements AST {
    constructor(public name: string, public value: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitAssignNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof AssignNode
            && this.name === node.name
            && this.value.equals(node.value)
    }
}

// While Loop Node
class WhileNode implements AST {
    constructor(public conditional: AST, public body: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitWhileNode(this)
    }

    equals(node: AST): boolean {
        return node instanceof WhileNode
            && this.conditional.equals(node.conditional)
            && this.body.equals(node.body)
    }
}


// Boolean Node
class Boolean implements AST {
    constructor(public value: boolean) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitBoolean(this)
    }

    equals(node: AST): boolean {
        return node instanceof Boolean
            && node.value === this.value
    }
}

// Undefined Node
class Undefined implements AST {
    constructor() { }

    visit<T>(v: Visitor<T>): T {
        return v.visitUndefined(this)
    }

    equals(node: AST): boolean {
        return node instanceof Undefined
    }
}

// Null Node
class Null implements AST {
    constructor() { }
    visit<T>(v: Visitor<T>): T {
        return v.visitNull(this)
    }

    equals(node: AST): boolean {
        return node instanceof Null
    }
}

// Array Literal
class ArrayLiteral implements AST {
    constructor(public elements: Array<AST>) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitArrayLiteral(this)
    }

    equals(node: AST): boolean {
        return node instanceof ArrayLiteral
            && this.elements.length === node.elements.length
            && this.elements.every((elt, i) => elt.equals(node.elements[i]))
    }
}

// Array Lookup
class ArrayLookup implements AST {
    constructor(public array: AST, public index: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitArrayLookup(this)
    }

    equals(node: AST): boolean {
        return node instanceof ArrayLookup
            && this.array.equals(node.array)
            && this.index.equals(node.index)
    }
}

// Array Length
class Length implements AST {
    constructor(public array: AST) { }

    visit<T>(v: Visitor<T>): T {
        return v.visitLength(this)
    }

    equals(node: AST): boolean {
        return node instanceof Length
            && this.array.equals(node.array)
    }

}

export {
    AST,
    NumberNode,
    IdNode,
    NotNode,
    IfNode,
    BlockNode,
    ReturnNode,
    CallNode,
    DivNode,
    MulNode,
    SubNode,
    AddNode,
    EqualsNode,
    NotEqualsNode,
    WhileNode,
    AssignNode,
    VarNode,
    FunctionNode,

    Boolean,
    Undefined,
    Null,

    ArrayLiteral,
    ArrayLookup,
    Length,

    Visitor,
    Label,
}
