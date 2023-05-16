import * as AST from "./ast"
import * as T from "./types"

let emit = console.log

export class CodeGenerator implements AST.Visitor<void> {
    static empty = () => new CodeGenerator(new Map(), -20)

    constructor(
        public locals: Map<string, number>,
        public nextLocalOffset: number
    ) { }

    visitNumberNode(node: AST.NumberNode): void {
        emit(`  ldr r0, =${node.value}`)
    }

    visitIdNode(node: AST.IdNode): void {
        let offset = this.locals.get(node.value)
        if (offset) {
            emit(`  ldr r0, [fp, #${offset}]`)
        } else {
            throw Error(`Undefined variable: ${node.value}`)
        }
    }

    visitNotNode(node: AST.NotNode): void {
        node.term.visit(this)
        emit(`  cmp r0, #0`)
        emit(`  moveq r0, #1`)
        emit(`  movne r0, #0`)
    }

    visitIfNode(node: AST.IfNode): void {
        let ifFalseLabel = new AST.Label()
        let endIfLabel = new AST.Label()
        node.conditional.visit(this)
        emit(`  cmp r0, #0`)
        emit(`  beq ${ifFalseLabel}`)
        node.consequence.visit(this)
        emit(`  b ${endIfLabel}`)
        emit(`${ifFalseLabel}:`)
        node.alternative.visit(this)
        emit(`${endIfLabel}:`)
    }

    visitBlockNode(node: AST.BlockNode): void {
        node.statements.forEach(stm => stm.visit(this))
    }

    visitReturnNode(node: AST.ReturnNode): void {
        node.term.visit(this)
        emit(`  mov sp, fp`)
        emit(`  pop {fp, pc}`)
    }

    visitCallNode(node: AST.CallNode): void {
        let n_args = node.args.length
        if (n_args === 0) {
            emit(`  bl ${node.callee}`)
        } else if (n_args === 1) {
            node.args[0].visit(this)
            emit(`  bl ${node.callee}`)
        } else if (n_args >= 2 && n_args <= 4) {
            emit(`  sub sp, sp, #16`)
            node.args.forEach((arg, i) => {
                arg.visit(this)
                emit(`  str r0, [sp, #${4 * i}]`)
            })
            emit(`  pop {r0, r1, r2, r3}`)
            emit(`  bl ${node.callee}`)
        } else {
            throw Error(
                "TODO: Add support for more than 4 args in function call")
        }
    }

    visitDivNode(node: AST.DivNode): void {
        node.left.visit(this)
        emit(`  push {r0, ip}`)
        node.right.visit(this)
        emit(`  pop {r1, ip}`)
        emit(`  udiv r0, r0, r1`)
    }

    visitMulNode(node: AST.MulNode): void {
        node.left.visit(this)
        emit(`  push {r0, ip}`)
        node.right.visit(this)
        emit(`  pop {r1, ip}`)
        emit(`  mul r0, r0, r1`)
    }

    visitSubNode(node: AST.SubNode): void {
        node.left.visit(this)
        emit(`  push {r0, ip}`)
        node.right.visit(this)
        emit(`  pop {r1, ip}`)
        emit(`  sub r0, r1, r0`)
    }

    visitAddNode(node: AST.AddNode): void {
        node.left.visit(this)
        emit(`  push {r0, ip}`)
        node.right.visit(this)
        emit(`  pop {r1, ip}`)
        emit(`  add r0, r0, r1`)
    }

    visitEqualsNode(node: AST.EqualsNode): void {
        node.left.visit(this)
        emit(`  push {r0, ip}`)
        node.right.visit(this)
        emit(`  pop {r1, ip}`)
        emit(`  cmp r0, r1`)
        emit(`  moveq r0, #1`)
        emit(`  movne r0, #0`)
    }

    visitNotEqualsNode(node: AST.NotEqualsNode): void {
        node.left.visit(this)
        emit(`  push {r0, ip}`)
        node.right.visit(this)
        emit(`  pop {r1, ip}`)
        emit(`  cmp r0, r1`)
        emit(`  moveq r0, #0`)
        emit(`  movne r0, #1`)
    }

    visitWhileNode(node: AST.WhileNode): void {
        let loopStart = new AST.Label()
        let loopEnd = new AST.Label()

        emit(`${loopStart}:`)
        node.conditional.visit(this)
        emit(`  cmp r0, #0`)
        emit(`  beq ${loopEnd}`)
        node.body.visit(this)
        emit(`  b ${loopStart}`)
        emit(`${loopEnd}:`)
    }

    visitAssignNode(node: AST.AssignNode): void {
        node.value.visit(this)
        let offset = this.locals.get(node.name)
        if (offset) {
            emit(`  str r0, [fp, #${offset}]`)
        } else {
            throw Error(`Undefined variable: ${node.name}`)
        }
    }

    visitVarNode(node: AST.VarNode): void {
        node.value.visit(this)
        emit(`  push {r0, ip}`)
        this.locals.set(node.name, this.nextLocalOffset - 4)
        this.nextLocalOffset -= 8
    }

    visitFunctionNode(node: AST.FunctionNode): void {
        if (node.signature.parameters.size > 4)
            throw Error("More than 4 params is not supported")
        emit(``)
        emit(`.global ${node.name}`)
        emit(`${node.name}:`)
        this.emitPrologue()
        const env = this.setUpEnvironment(node.signature)
        node.body.visit(env)
        this.emitEpilogue()
    }

    emitPrologue() {
        emit(`  push {fp, lr}`)
        emit(`  mov fp, sp`)
        emit(`  push {r0, r1, r2, r3}`)
    }

    emitEpilogue() {
        emit(`  mov sp, fp`)
        emit(`  mov r0, #0`)
        emit(`  pop {fp, pc}`)
    }

    setUpEnvironment(signature: T.FunctionType) {
        let locals = new Map()
        let parameters = Array.from(signature.parameters.keys())
        parameters.forEach((p, i) => {
            locals.set(p, 4 * i - 16)
        })
        return new CodeGenerator(locals, -20)
    }


    visitBoolean(node: AST.Boolean) {
        if (node.value) {
            emit(`  mov r0, #1`)
        } else {
            emit(`  mov r0, #0`)
        }
    }

    visitUndefined(node: AST.Undefined) {
        emit(`  mov r0, #0`)
    }

    visitNull(node: AST.Null) {
        emit(`  mov r0, #0`)
    }

    visitArrayLiteral(node: AST.ArrayLiteral) {
        let length = node.elements.length
        emit(`  ldr r0, =${4 * (length + 1)}`)
        emit(`  bl malloc`)
        emit(`  push {r4, ip}`)
        emit(`  mov r4, r0`)
        emit(`  ldr r0, =${length}`)
        emit(`  str r0, [r4]`)
        node.elements.forEach((elt, i) => {
            elt.visit(this)
            emit(`  str r0, [r4, #${4 * (i + 1)}]`)
        })
        emit(`  mov r0, r4`)
        emit(`  pop {r4, ip}`)
    }

    visitArrayLookup(node: AST.ArrayLookup) {
        node.array.visit(this)
        emit(`  push {r0, ip}`)
        node.index.visit(this)
        emit(`  pop {r1, ip}`)
        emit(`  ldr r2, [r1]`)
        emit(`  cmp r0, r2`)
        emit(`  movhs r0, #0`)
        emit(`  addlo r1, r1, #4`)
        emit(`  lsllo r0, r0, #2`)
        emit(`  ldrlo r0, [r1, r0]`)
    }

    visitLength(node: AST.Length) {
        node.array.visit(this)
        emit(`  ldr r0, [r0, #0]`)
    }
}