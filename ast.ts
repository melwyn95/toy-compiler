interface AST {
    equals(node: AST): boolean
}

/* AST Nodes */

// Number node
class NumberNode implements AST {
    constructor(public value: number) { }
    equals(node: AST): boolean {
        return node instanceof NumberNode
            && node.value === this.value
    }
}

// Identifier Node
class IdNode implements AST {
    constructor(public value: string) { }
    equals(node: AST): boolean {
        return node instanceof IdNode
            && node.value === this.value
    }
}

// Not (!) operator Node
class NotNode implements AST {
    constructor(public term: AST) { }
    equals(node: AST): boolean {
        return node instanceof NotNode
            && this.term.equals(node.term)
    }
}

// Equals (==) operator Node
class EqualsNode implements AST {
    constructor(public left: AST, public right: AST) { }
    equals(node: AST): boolean {
        return node instanceof EqualsNode
            && this.left.equals(node.left)
            && this.right.equals(node.right)
    }
}

// Add (+) operator Node
class AddNode implements AST {
    constructor(public left: AST, public right: AST) { }
    equals(node: AST): boolean {
        return node instanceof AddNode
            && this.left.equals(node.left)
            && this.right.equals(node.right)
    }
}

// Sub (-) operator Node
class SubNode implements AST {
    constructor(public left: AST, public right: AST) { }
    equals(node: AST): boolean {
        return node instanceof SubNode
            && this.left.equals(node.left)
            && this.right.equals(node.right)
    }
}

// Mul (*) operator Node
class MulNode implements AST {
    constructor(public left: AST, public right: AST) { }
    equals(node: AST): boolean {
        return node instanceof MulNode
            && this.left.equals(node.left)
            && this.right.equals(node.right)
    }
}

// Div (/) operator Node
class DivNode implements AST {
    constructor(public left: AST, public right: AST) { }
    equals(node: AST): boolean {
        return node instanceof DivNode
            && this.left.equals(node.left)
            && this.right.equals(node.right)
    }
}

// Function Call/Application Node
class CallNode implements AST {
    constructor(public callee: string, public args: Array<AST>) { }
    equals(node: AST): boolean {
        return node instanceof CallNode
            && this.callee == node.callee
            && this.args.every((arg, i) => arg.equals(node.args[i]))
    }
}

// Return Node
class ReturnNode implements AST {
    constructor(public term: AST) { }
    equals(node: AST): boolean {
        return node instanceof ReturnNode
            && this.term.equals(node.term)
    }
}

// Block Node
class BlockNode implements AST {
    constructor(public statements: Array<AST>) { }
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
        public parameters: Array<string>,
        public body: AST) { }
    equals(node: AST): boolean {
        return node instanceof FunctionNode
            && this.name === node.name
            && this.parameters.length === node.parameters.length
            && this.parameters.every(
                (param, i) => param === node.parameters[i])
            && this.body.equals(node.body)
    }
}

// Variable Declaration Node
class VarNode implements AST {
    constructor(public name: string, public value: AST) { }
    equals(node: AST): boolean {
        return node instanceof VarNode
            && this.name === node.name
            && this.value.equals(node.value)
    }
}

// Assignment Node 
class AssignNode implements AST {
    constructor(public name: string, public value: AST) { }
    equals(node: AST): boolean {
        return node instanceof AssignNode
            && this.name === node.name
            && this.value.equals(node.value)
    }
}

// While Loop Node
class WhileNode implements AST {
    constructor(public conditional: AST, public body: AST) { }
    equals(node: AST): boolean {
        return node instanceof WhileNode
            && this.conditional.equals(node.conditional)
            && this.body.equals(node.body)
    }
}