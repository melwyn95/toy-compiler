# Basic ARM stuff

## Machine Word 

Working with 32-bit instruction set.

Word = 32 bits (4 bytes)

Byte = 8 bits

Hexadecimal notation is convinient e.g. 0xC3_B1_6F_70 
(because it is terse & easy to split into bytes).

## Memory

Segments
1. Data
2. Code
3. Stack
4. Heap

1 Memory Address = 32 bits

Can only address Aligned words (word adresses divisible by 4)

Pointer: When a Word contains address of another Word

## Registers

16 Main Registers & 1 special status register (CPSR)

Registers are very fast.

ARM is based on load-store architecture.
1. Load data into registers from memory
2. Perform operations of registers
3. Store data back into memory

(Other architectures are stack-bases & accumulator-base)[Read about it later]

### All registers

```

+----+  +----------+ 
| r0 |  | r8       | 
+----+  +----------+ 
| r1 |  | r9       | 
+----+  +----------+ 
| r2 |  | r10      | 
+----+  +----------+ 
| r3 |  | r11 (fp) | (Frame Pointer)
+----+  +----------+ 
| r4 |  | r12 (ip) | (Intra-Procedure Scratch Register)
+----+  +----------+ 
| r5 |  | r13 (sp) | (Stack Pointer)
+----+  +----------+ 
| r6 |  | r14 (lr) | (Link Register)
+----+  +----------+ 
| r7 |  | r15 (pc) | (Program Counter)
+----+  +----------+

+------+
| CPSR | (Current Program Status Register)
+------+

```

## Instructions

All ARM instructions are encoded into 32-bit words

### Add instruction

3-operand instruction

```asm
add r1, r2, r3
```

```
r1 = r2 + r3
```

### Immediante operands

```asm
add r1, r2, #6400

add r1, r2, #0xFA00
```

When the immediate operand is too big, the instruction encode the `even` number 
of times the operand must be shifted.

```

+-------------+--+---------+---------+---------+---------+-----------------+
|1 1 1 0 0 0 1 0 | 1 0 0 0 | 0 0 1 0 | 0 0 0 1 | 0 0 1 0 | 1 1 1 1 1 0 1 0 |
+-------------+--+---------+---------+---------+---------+-----------------+
              ^            ^         ^         ^         ^                 ^
              |     add    |    r2   |    r1   |  shift  |       0xFA      |  
              +------------+---------+---------+---------+-----------------+

```

### Signed, unsigned & 2's complemetn

two's complement is a binarg representation for negative number which allows
for using the same hardware adder.

Two's Complement = Invert the bits & Add 1

```
twos_complement(x) => ~x + 1
```

  0b1111_1100  ---> 252 or -4
+ 0b0000_0010  --->   2 or  2
--------------
  0b1111_1110  ---> 254 or -2

### Range of Signed & Unsigned number (binary)

```

+-------------+-----------+-----------+
| Bit pattern |  Unsigned | Signed    |
+-------------+-----------+-----------+
| 0b0000_0000 |     0     |     0     |
| 0b0000_0001 |     1     |     1     |
| 0b0000_0010 |     2     |     2     |
|     ...     |    ...    |    ...    |
| 0b0000_1101 |    125    |    125    |
| 0b0000_1110 |    126    |    126    |
| 0b0000_1111 |    127    |    127    |
|     ...     |    ...    | overflow  |
| 0b1000_0000 |    128    |   -128    |
| 0b1000_0001 |    129    |   -127    |
| 0b1000_0010 |    130    |   -126    |
|     ...     |    ...    |    ...    |
| 0b1111_1100 |    252    |    -4     |
| 0b1111_1101 |    253    |    -3     |
| 0b1111_1110 |    254    |    -2     |
| 0b1111_1111 |    255    |    -1     |
|     ...     |  overflow |    ...    |
| 0b0000_0000 |     0     |     0     |
| 0b0000_0001 |     1     |     1     |
| 0b0000_0010 |     2     |     2     |
| 0b0000_0011 |     3     |     3     |
|     ...     |    ...    |    ...    |
+-------------+-----------+-----------+

```

### Arithmetic & Logic instructions

```

+-------------------+------------------+-----------------+
|    Instruction    |     Mnemonic     |      Effect     |
+-------------------+------------------+-----------------+
|   add r1, r2, r3  |       Add        | r1 = r2 + r2;   |
|   sum r1, r2, r3  |     Subtract     | r1 = r2 - r3;   |
|   mul r1, r2, r3  |     Multiply     | r1 = r2 * r3;   |
|  sdiv r1, r2, r3  |   Signed divide  | r1 = r2 / r3;   |
|  udiv r1, r2, r3  |  Unsigned divide | r1 = r2 / r3;   |
|   bic r1, r2, r3  |   Bitwise clear  | r1 = r2 & ~r3;  |
|   and r1, r2, r3  |   Bitwise and    | r1 = r2 & r3;   |
|   orr r1, r2, r3  |   Bitwise or     | r1 = r2 | r3;   |
|   eor r1, r2, r3  |   Bitwise xor    | r1 = r2 ^ r3;   |
+-------------------+------------------+-----------------+


```

### Move instruction

Copy one word between registers. (or move immediate operand to register)

```

+-------------------+------------------+-----------------+
|    Instruction    |     Mnemonic     |      Effect     |
+-------------------+------------------+-----------------+
| mov r1, r2        |       Move       |     r1 = r2;    |
| mvn r1, r2        |     Move-not     |     r1 = ~r2;   |
+-------------------+------------------+-----------------+

```

### Program Counter

Program Counter is a pointer to the currently executing instruction.

```
mov pc, r0
```

Note: Every instruction affects the program counter 
(i.e. It is atleat incremented by 4 bytes (next instruction))

```
add r1, r2, r3 /* pc += 4; r1 = r2 + r3; */
```

```
mov r0, #0      /* pc += 4; r0 = 0      */
add r0, r0, #1  /* pc += 4; r0 = r0 + 1 */
add r0, r0, #1  /* pc += 4; r0 = r0 + 1 */
add pc, pc, #8  /* pc += 4; pc = pc + 8 */
add r0, r0, #1  /*    ... skipped ...   */
add r0, r0, #1  /*    ... skipped ...   */
add r0, r0, #1  /* pc += 4; r0 = r0 + 1 */
```

### Branch Instruction

Branch instruction jumps to a label (some instruction), The assemblem calculates,
The offsets that need to be applied to pc.

```
  mov r0, #0
  add r0, r0, #1
  add r0, r0, #1
  b myLabel      /* pc = myLabel */
  add r0, r0, #1 /* ... skipped ... */
  add r0, r0, #1 /* ... skipped ... */
myLabel:
  add r0, r0, #1
```

### Branch and Exchange

The `b` (branch) instruction jumps to a label relative to `pc`, the `bx` (branch & 
exhange) instruction jumps to an address stored in a register.

```
bx r0 /* pc = r0 */
```

This is similar to `mov pc, r0`

### Branch and Link

Similar to Branch (`b`) along with jumping it stores previous the values of `pc`
in the link register (`r14`).

```
bl myLabel /* lr = pc ; pc = myLabel */
```

```
mov lr, pc;
b muLabel;
```

bl is commonly used to implement funcation calls.

### Intra-procedure-call scratch register

`b` & `bl` are capable of jumping +- 32 MR of address space, If a jump of more 
than 32 MB is required the linker will arrage for veneer: jump to special place 
within 32 MB and then load a full 32 bit address into `pc`, if a longer jump is 
required.

intra-procedure-call scratch register: `r12` or `ip`, most relevant for funtion 
call it is used between function calls, after the caller calls but before the
control transferes to the callee funtion.

Also scratch register, because it is best suited for temporary values.

### Function call basics

bl stores the return address in the register lr

```
  mov r0, #0       /* r0 = 0; */
  bl addFourtyTwo  /* lr = pc; pc = addFourtyTwo */
  sub r0, #3       /* r0 = r0 - 3; */
addFourtyTwo:
  add r0, r0, #42  /* r0 = ro + 42; */
  bx lr            /* pc = lr; */
```

### Link register

`lr` (`r14`) is a special register that `bl` works with. before jumping `bl` 
stores the return address in `r14` or `lr`.

It call link register because it creates a link between caller & callee.

### Conditional Execution (CPSR register)

- Comparison instruction `cmp` compares 2 register or 1 register & 1 immediate
  value and saves the resul of comparison in `CPSR` register.
- An instruction(s) with *comditional code* read the `CPRS` and execures or not
  depending on the condition code. 

`CPSR`: Current Program Status Register.

```
cmp r1, r2     /* cprs = compare(r1, r2); */
moveq r1, #10  /* if (eq(cprs)) { r1 = 10; } */
mov r2, #20    /* r2 = 20 */
moval r3, #20  /* r3 = 20 */
movne r4, #30  /* if (ne(cprs)) { r4 = 30; } */
```

`mov`   - set value into register
`moveq` - set value into register if result of `cmp` was equal
`movne` - set value into register if result of `cmp` was not equal
`moval` - same as `mov`

Condition Codes:

```

+------+----------+--------------------+-----------------+
| Code | Operator |    Description     | Signed/Unsigned |
+------+----------+--------------------+-----------------+
|  eq  |   ==     |     Equal          |     Either      |
|  ne  |   !=     |   Not equal        |     Either      |
|      |          |                    |                 |
|  gt  |   >      | Greater Than       |     Signed      |
|  ge  |   >=     | Greater Than equal |     Signed      |
|  lt  |   <      | Less Than          |     Signed      |
|  le  |   <=     | Less Than equal    |     Signed      |
|      |          |                    |                 |
|  hi  |   >      | Greater Than       |    Unsigned     |
|  hs  |   >=     | Greater Than equal |    Unsigned     |
|  lo  |   <      | Less Than          |    Unsigned     |
|  ls  |   <=     | Less Than equal    |    Unsigned     |
|      |          |                    |                 |
|  al  |   __     |  Always (default)  |     ____        | 
+------+----------+--------------------+-----------------+

```

The condition codes can be added to almost any ARM instruction.

ARM instuction set is orthogonal: conditional execution is available regardless
of instruction type.

### Conditional Branching

Conditional branching is acheived by combining branch instruction `b` with 
condition codes. Conditional branching is used to implement `if`, `else`, `for`,
`while`.

### Loader

Loader is an operating system program which copies the assembly program from
disk into memory & sets the `pc` (program counter) to execute from `main`.

  The real entry point is called `_start`, when `libc` is linked the execution
  starts from `libc`'s `_start` which set's things up like the command line args
  internally the `main` will be called (which needs to be defined in `.global`).

### Data & Code sections

Data segment declared with `.data` directive is read, write, but not execute.

Code segment declared with `.text` directive is read, but not write, execute.

### Segmentation fault

