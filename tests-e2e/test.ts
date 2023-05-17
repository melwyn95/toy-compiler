import * as c from "child_process"
import * as fs from "fs"

const compile = (file: string) => `node ${__dirname}/compiler.js ${__dirname}/${file}`

// FIXME: try using compile api instead of spawing a process
let test_compile = (file: string, typecheck = false) => {
    let s = c.spawnSync(`node`,
        [`${__dirname}/compiler.js`,
        `${__dirname}/${file}`,
        typecheck ? "--typecheck" : ""]
    )
    return s.stdout.toString("utf-8") + s.stderr.toString("utf-8")
}

// FIXME: try using compile api instead of spawing a process
let test = (file: string, typecheck = false) => {
    let asm = c.execSync(compile(file)).toString()
    fs.writeFileSync(`${file}.s`, asm)
    let s = c.spawnSync(`${__dirname}/../scripts/run_asm.sh`,
        [`${file}.s`, typecheck ? "--typecheck" : ""]
    )
    return s.stdout.toString("utf-8") + s.stderr.toString("utf-8")
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

console.assert(test("segfault.baseline", true).includes("Segmentation fault"))

console.assert(test("factorial_typed.baseline", true) ===
    `...........Exit code = 0\n`)

console.assert(test("factorial_typed.baseline", true) ===
    `...........Exit code = 0\n`)

console.assert(test("test_typed.baseline", true) ===
    `................................Exit code = 0
`)

console.assert(test_compile("type_error.baseline", true)
    .includes(`TypeError: Expected number, but got boolean`))
