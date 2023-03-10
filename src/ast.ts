let emit = console.log

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
    emit(): void;
    equals(node: AST): boolean;
}

/* AST Nodes */

// Number node
class NumberNode implements AST {
    constructor(public value: number) { }

    emit() {
        emit(`  ldr r0, =${this.value}`)
    }

    equals(node: AST): boolean {
        return node instanceof NumberNode
            && node.value === this.value
    }
}

// Identifier Node
class IdNode implements AST {
    constructor(public value: string) { }

    emit() {
        throw Error("Not implemented yet");
    }

    equals(node: AST): boolean {
        return node instanceof IdNode
            && node.value === this.value
    }
}

// Not (!) operator Node
class NotNode implements AST {
    constructor(public term: AST) { }

    emit() {
        this.term.emit()
        emit(`  cmp r0, #0`)
        emit(`  moveq r0, #1`)
        emit(`  movne r0, #0`)
    }

    equals(node: AST): boolean {
        return node instanceof NotNode
            && this.term.equals(node.term)
    }
}

// Equals (==) operator Node
class EqualsNode implements AST {
    constructor(public left: AST, public right: AST) { }

    emit() {
        this.left.emit()
        emit(`  push {r0, ip}`)
        this.right.emit()
        emit(`  pop {r1, ip}`)
        emit(`  cmp r0, r1`)
        emit(`  moveq r0, #1`)
        emit(`  movne r0, #0`)
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

    emit() {
        this.left.emit()
        emit(`  push {r0, ip}`)
        this.right.emit()
        emit(`  pop {r1, ip}`)
        emit(`  cmp r0, r1`)
        emit(`  moveq r0, #0`)
        emit(`  movne r0, #1`)
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

    emit() {
        this.left.emit()
        emit(`  push {r0, ip}`)
        this.right.emit()
        emit(`  pop {r1, ip}`)
        emit(`  add r0, r0, r1`)
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

    emit() {
        this.left.emit()
        emit(`  push {r0, ip}`)
        this.right.emit()
        emit(`  pop {r1, ip}`)
        emit(`  sub r0, r1, r0`)
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

    emit() {
        this.left.emit()
        emit(`  push {r0, ip}`)
        this.right.emit()
        emit(`  pop {r1, ip}`)
        emit(`  mul r0, r0, r1`)
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

    emit() {
        this.left.emit()
        emit(`  push {r0, ip}`)
        this.right.emit()
        emit(`  pop {r1, ip}`)
        emit(`  udiv r0, r0, r1`)
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

    emit() {
        let n_args = this.args.length
        if (n_args === 0) {
            emit(`  bl ${this.callee}`)
        } else if (n_args === 1) {
            this.args[0].emit()
            emit(`  bl ${this.callee}`)
        } else if (n_args >= 2 && n_args <= 4) {
            emit(`  sub sp, sp, #16`)
            this.args.forEach((arg, i) => {
                arg.emit()
                emit(`  str r0, [sp, #${4 * i}]`)
            })
            emit(`  pop {r0, r1, r2, r3}`)
            emit(`  bl ${this.callee}`)
        } else {
            throw Error(
                "TODO: Add support for more than 4 args in function call")
        }
    }

    equals(node: AST): boolean {
        return node instanceof CallNode
            && this.callee == node.callee
            && this.args.every((arg, i) => arg.equals(node.args[i]))
    }
}

// Return Node
class ReturnNode implements AST {
    constructor(public term: AST) { }

    emit() {
        throw Error("Not implemented yet");
    }

    equals(node: AST): boolean {
        return node instanceof ReturnNode
            && this.term.equals(node.term)
    }
}

// Block Node
class BlockNode implements AST {
    constructor(public statements: Array<AST>) { }

    emit() {
        this.statements.forEach(stm => stm.emit())
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

    emit() {
        let ifFalseLabel = new Label()
        let endIfLabel = new Label()
        this.conditional.emit()
        emit(`  cmp r0, #0`)
        emit(`  beq ${ifFalseLabel}`)
        this.consequence.emit()
        emit(`  b ${endIfLabel}`)
        emit(`${ifFalseLabel}:`)
        this.alternative.emit()
        emit(`${endIfLabel}:`)
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
        public parameters: Array<string>,
        public body: AST) { }

    emit() {
        throw Error("Not implemented yet");
    }

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

    emit() {
        throw Error("Not implemented yet");
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

    emit() {
        throw Error("Not implemented yet");
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

    emit() {
        throw Error("Not implemented yet");
    }

    equals(node: AST): boolean {
        return node instanceof WhileNode
            && this.conditional.equals(node.conditional)
            && this.body.equals(node.body)
    }
}

/* Nodes of testing */

// Main function node
class Main implements AST {
    constructor(public statements: Array<AST>) { }

    emit() {
        emit(`.global main`)
        emit(`main:`)
        emit(`  push {fp, lr}`)
        this.statements.forEach(stm =>
            stm.emit()
        )
        emit(`  mov r0, #0`)
        emit(`  pop {fp, pc}`)
    }

    equals(node: AST): boolean {
        return node instanceof Main
            && this.statements.length === node.statements.length
            && this.statements.every((stm, i) => stm.equals(node.statements[i]))
    }
}

// Assert node
class Assert implements AST {
    constructor(public condition: AST) { }

    emit() {
        this.condition.emit()
        emit(`  cmp r0, #1`)
        emit(`  moveq r0, #'.'`)
        emit(`  movne r0, #'F'`)
        emit(`  bl putchar`)
    }

    equals(node: AST): boolean {
        return node instanceof Assert
            && this.condition.equals(node.condition)
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

    Main,
    Assert,
}
