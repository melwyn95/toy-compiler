# toy-compiler
Working though the book ["Compiling to Assembly from Scratch"](https://keleshev.com/compiling-to-assembly-from-scratch/).

[Notes on ARM assembly](./ARM.md)

### TODO(s)

- [ ] Proper test bench set-up
- [ ] Proper CLI
- [ ] Fix CLI args parsing

- [ ] Add for-loops
- [ ] Add operation-assignment operator (+=, -=, ...)
- [ ] Add comparison operators (>, <, >=, <=)
- [ ] Add support for functions/calls with more than 4 arguments
- [ ] Specialize code for 1, 2, 3 & 4 registerd in function deifinition
- [ ] Use vacantOffsets for saving stack space for Var nodes
- [ ] Add support for block scopes bindings (let & const)
- [ ] Implement strings using byte variant of instruction (`ldrb` & `strb`)


- [ ] Port compiler & tests to OCaml
- [ ] Add WebAssembly Backend after ARM