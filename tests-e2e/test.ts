import * as c from "child_process"
import * as fs from "fs"

const compile = (file: string) => `node ${__dirname}/compiler.js ${__dirname}/${file}`

const runASM = (file: string) => `${__dirname}/../scripts/run_asm.sh ${file}.s`

let test = (file: string) => {
    let asm = c.execSync(compile(file)).toString()
    fs.writeFileSync(`${file}.s`, asm)
    return c.execSync(runASM(file)).toString()
}

console.assert(test("test.baseline") ===
    `.F..F.aARM.IE\n\tH\n........Exit code = 0\n`)

console.assert(test("factorial.baseline") ===
    `...........Exit code = 0\n`)

console.assert(test("fact_recursive.baseline") ===
    `...........Exit code = 0\n`)

console.assert(test("ext.baseline") ===
    `.F.FExit code = 0\n`)

console.assert(test("ext_array.baseline") ===
    `.......Exit code = 0\n`)