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

```
  0b1111_1100  ---> 252 or -4
+ 0b0000_0010  --->   2 or  2
--------------
  0b1111_1110  ---> 254 or -2
```

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

```asm
mov pc, r0
```

Note: Every instruction affects the program counter 
(i.e. It is atleat incremented by 4 bytes (next instruction))

```asm
add r1, r2, r3 /* pc += 4; r1 = r2 + r3; */
```

```asm
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

```asm
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

```asm
bx r0 /* pc = r0 */
```

This is similar to `mov pc, r0`

### Branch and Link

Similar to Branch (`b`) along with jumping it stores previous the values of `pc`
in the link register (`r14`).

```asm
bl myLabel /* lr = pc ; pc = myLabel */
```

```asm
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

```asm
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

```asm
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

It can happen when we try write to a read-only segment.

In general segmentation fault is all kinds of memory access violation.

In the [example](./asm/segmentation_fault.s) the segmentation fault is because
the string hello is not aligned (4 bytes boundary)
This can be solved by padding the string with additional `\0`'s untill it is 
aligned, or we can use `.balign 4` to align it.

`.balign n` always aligns at a boundary specified as a number of bytes ( `n`)

### Data directive

`.string` & `.word`

`.string` - zero terminated (`\0`) string

`.word`   - literal machine work (numeric notation)

It is good to put labels before data diretives.

```asm
fourtyTwo:
  .word 42
```

Data directives are another encoding for binary data.

```asm
.global main
main:
  .word 0xE3A0002A /* Same as `mov r0, #42` */
  bx lr
```

### Loading data

Loading data from RAM to Registers.

```asm
ldr r0, =hello
bl printf
```

We can load the address of any word using `ldr`.

```asm
ldr r1, =myWord  /*   Referencing: r1 = myWord */
ldr r0, [r1]     /* Dereferencing: r0 = M[r1]  */

myWord:
  .word 42
```

When address of another word is stored in register, it is called *pointer*,
it *references* another word.

When a word which referenced by a pointer is loaded, it is called *dereferecing*
using the notaion `[]`

When the constant we are trying to load does not fit into an *immediate* value,
It will dereference it via a temporary word.

```asm
ldr r1, =temporaryWord /* r1 = temporaryWord */
ldr r1, [r1]           /* r1 = M[r1]         */

...

temporaryWord:
  .word 42     /* can be any large data */
```

This expansion of instruction is called *pseudo-instruction*.

### Load with immediate offset

It is possible to load data from a label with an *offset*

```asm
myArray:
  .word 42
  .word 44
  .word 46
```

can also be written as

```asm
myArray:
  .word 42, 44, 46
```

To load the third word (`46`) we have the following syntax.

```asm
ldr r1, =myArray  /* r1 = myArray   */
ldr r0, [r1, #8]  /* r0 = M[r1 + 8] */
```

The offset can be positive or negative. Also it can be immediate.

```asm
ldr r0, [r1, -r2] /* r0 = M[r1 - r2] */
```

### Storing data

Storing data means copying data from register into memory (Registers -> RAM)

Data can be stored in `.data` segment, stack & heap.

Store instruction has the mnemonic `str` & syntax is same as `ldr` instruction.

```asm
str r0, [r1] /* M[r1] = r0 */
ldr r0, [r1] /* r0 = M[r1] */

str r0, [r1, #8] /* M[r1 + 8] = r0 */
ldr r0, [r1, #8] /* r0 = M[r1 + 8] */

str r0, [r1, -r2] /* M[r1 - r2] = r0 */
ldr r0, [r1, -r2] /* r0 = M[r1 - r2] */
```

### Stack

Stack is a memory segment used to implement nested and recursive function calls.

When working with stack we need to follow the *calling convention*
(We need to follow the calling convention so that function written in diffent
languages or using different compiler can ineroperate).

e.g. When calling `printf` from `libc` we need to following calling convention.
(Also when we want other functions to call user defined function like `main`
we need to follow the convention.)

### Push and pop

*stack pointer* refers to the address of *top of the stack*.

It also referred as `r13` or `sp`.

The stack *grows* towards the smaller addressed & *shrinks* towards larger 
addresses.

```asm
push {r0, r1, r2, r3} // push 4 words onto the stack.
```

Effect of `push` instruction on the stack. (words are copied from registers 
to the stack)

```
Before:

     Registers           Stack                                        
   +-----------+     +-----------+                                      
r0 |     10    |     |           |                                      
   +-----------+     +-----------+                                      
r1 |     20    |     |           |                                      
   +-----------+     +-----------+                                      
r2 |     30    |     |           |                                      
   +-----------+     +-----------+                                      
r3 |     40    |     |           |                                      
   +-----------+     +-----------+                                      
   |    ...    |     |           |                                      
   +-----------+     +-----------+                                      
fp |           |     |           |                                      
   +-----------+     +-----------+                                      
ip |           |     |           |                                      
   +-----------+     +-----------+                                      
sp |     O-----|---->|           |                                      
   +-----------+     +-----------+                                      
lr |           |     |           |                                      
   +-----------+     +-----------+                                      
pc |           |     |           |                                      
   +-----------+     +-----------+                                      

After:

     Registers           Stack                                        
   +-----------+     +-----------+                                      
r0 |     10    |     |           |                                      
   +-----------+     +-----------+                                      
r1 |     20    |     |           |                                      
   +-----------+     +-----------+                                      
r2 |     30    |     |           |                                      
   +-----------+     +-----------+                                      
r3 |     40    |  +->|    10     |                                      
   +-----------+  |  +-----------+                                      
   |    ...    |  |  |    20     |                                      
   +-----------+  |  +-----------+                                      
fp |           |  |  |    30     |                                      
   +-----------+  |  +-----------+                                      
ip |           |  |  |    40     |                                      
   +-----------+  |  +-----------+                                      
sp |     O-----|--+  |           |                                      
   +-----------+     +-----------+                                      
lr |           |     |           |                                      
   +-----------+     +-----------+                                      
pc |           |     |           |                                      
   +-----------+     +-----------+                                      


```

This can effectively be done by *decrementing* the stack pointer (`sp`).
As stack grows towards smaller addresses.

```asm
sub sp, sp, #16  // decrement the stack pointer by 16 bytes (4 words)
str r0, [sp, #0]
str r1, [sp, #4]
str r2, [sp, #8]
str r3, [sp, #12]
```

or alternately

```asm
push {r3}
push {r2}
push {r1}
push {r0}
```

the `pop` instruction is counterpart to `push` instruction.

```asm
pop {r0, r1, r2, r3}
```

This instruction reverses the effect of the `push` instruction i.e. 
1. It *increments* the `sp` by 16 bytes.
2. Copies the values from stack into registers.

```asm
pop {r0}
pop {r1}
pop {r2}
pop {r3}
```

These instructions `push` & `pop` use curly braces (`{}`) notation, this kinda
signifies set notation. The order in which you write the register does not 
matter.

```asm
push {r3, r1, r2, r0} // Same as: push {r0, r1, r2, r3}
```

The order is picked so that `pop` undo's the effect of `push`.
- Lower register (e.g. `r0`) are pushed to and popped from lower memory 
  addresses.
- Higher registers (e.g. `r15`) are push to and popped from lower memory
  addresses.

The `push` & `pop` instruction's have dedicated 16-bit flag in their encoding,
So that they can express which registers to `push` or `pop` but not their order.

The order is picked such that `pop` operation would undo the effect of
corresponding `push` operation.

### Stack alignment

When calling `libc` functions the stack pointer (`sp`) needs to aligned at the
8-byte (2-word) boundary. (*`external interfaces`*)

For us *the stack pointer should always be 8-byte (2-word) aligned*.

If we want to push just a single word onto the stack, We push some dummy register
to maintain stack alignment

```asm
push {r4} // The stack won't be aligned with this

push {ip, r4} // By pushing the dummy (`ip`) register we maintain stack alignment
```

In the `main` function example, we push the `ip` register to maintain stack
alignment.

```asm
.global main
main:
  push {ip, lr}
  ...
```

In general to maintain stack alignment we can push a dummy register.

### Arguments and return value

Function arguments are passed in first four registers `r0-r3`, i.e. first four
argument to the function are passed in the registers `r0-r3`.

These registers are sometimes called as *argument registers*.

The rest of the arguments are passed by pushing them onto the stack.

For a function call like `f(10, 20, 30, 40, 50, 60)` we need to generate the 
following assembly

```asm

mov r0, #50
mov r1, #60
push {r0, r1}  // 50 & 60 go onto the stack
mov r0, #10    // 10, 20, 30 & 40 go into registers
mov r1, #20
mov r2, #30
mov r3, #40
bl f           // Actual function call
add sp, sp, #8 // Deallocate 2 words of stack

```

It is the callers responsibility to deallocate the stack space used for extra
arguments (> 5).

After a function returns, the return value is expected in the register `r0`.
(If the function returns a 64-bit value then it can span the registers `r0-r1`).

### Register conventions

When a function call is made some registers are *clobbered* after the 
call returns, and some registers are *preserved*.

Registers `r0-r3` which are used to pass arguments to the function are 
*call-clobbered* (since there can be nested function calls).

The link register `lr`/`r14` is *call-clobbered* by design of the instruction
`bl`, which overwrites `lr` with the return address.

The `ip`/`r12` register is also *call-clobbered* by linker generated veneer.

Other registes are *call-preserved*, If a function makes changes to such 
registers, it the responsiblity of function to restore the original values 
before returning from the call.

*call-clobbered* registers are a good fit for passing function arguments.

*call-preserved* registers are a good git for variables.

`r4-r10` are sometimes called as *variable registers*.

The stack pointer (`sp`/`r11`), frame pointer (`fp`/`r13`) and 
program counter (`pc`/`r15`) are *call-preserved* registers.

In order to preserve *call-preserved* registers, when the call starts these
registers (only the one's that need to preserved) are push onto the stack, and 
these values are poped back into registers before returning the call, in short
we are *saving* these register on the stack.

There is an alternate terminology for *call-clobbered* & *call-preserved*,
they are *callee-saved* & *caller-saved*, This referes to which side of the call
is responsible for saving the register's onto the stack.

```

+----------+------------------------------------+------------------------------+
| Register |                Role                |          Convention          |
+----------+------------------------------------+------------------------------+
| r0       | Argument/Return register           | Call Clobbered               |
+----------+------------------------------------+------------------------------+
| r1       | Argument register                  | Call Clobbered               |
+----------+------------------------------------+------------------------------+
| r2       | Argument register                  | Call Clobbered               |
+----------+------------------------------------+------------------------------+
| r3       | Argument register                  | Call Clobbered               |
+----------+------------------------------------+------------------------------+
| r4       | Variable register                  | Call Preserved               |
+----------+------------------------------------+------------------------------+
| r5       | Variable register                  | Call Preserved               |
+----------+------------------------------------+------------------------------+
| r6       | Variable register                  | Call Preserved               |
+----------+------------------------------------+------------------------------+
| r7       | Variable register                  | Call Preserved               |
+----------+------------------------------------+------------------------------+
| r8       | Variable register                  | Call Preserved               |
+----------+------------------------------------+------------------------------+
| r9       | Variable register                  | Call Preserved               |
+----------+------------------------------------+------------------------------+
| r10      | Variable register                  | Call Preserved               |
+----------+------------------------------------+------------------------------+
| r11 (fp) | Frame pointer                      | Call Preserved               |
+----------+------------------------------------+------------------------------+
| r12 (ip) | Intra-procedure scratch register   | Call Clobbered               |
+----------+------------------------------------+------------------------------+
| r13 (sp) | Stack pointer                      | Call Preserved               |
+----------+------------------------------------+------------------------------+
| r14 (lr) | Link register                      | Call Clobbered               |
+----------+------------------------------------+------------------------------+
| r15 (pc) | Program counter                    | Call Preserved               |
+----------+------------------------------------+------------------------------+

```

### Frame pointer

Frame pointer (`r11`/`fp`) points to the start of the function's *frame*.

A function frame is also called *stack frame*, *call frame*, *activation record*

*frame pointer* points to the *base* of the frame. (address where 
*stack pointer* used to point to when function was called.)

The area between *frame pointer* and *stack pointer* is the current function's
stack frame.

By convention we save the old *frame pointer* in the stack slot which is pointed
by the current *frame pointer*. (In this way we get a linked-list of 
stack frames, the head is the current *frame pointer* & intermediate links are
stack saved frame pointers of the callers.)

It is optional to use *frame pointer* register (like it is optional to maintain
the linked-list of stack frames), Is is used by debuggers & useful to implement
exception handling.

The *frame pointer* does not change after a function is called so it is
convinient to refer to data on stack (local variables, function arguments)
relative to the frame pointer.

```

    Registers                Stack
                            
                             ....       
                        +--------------+        
                        |              |  
    +--------+          +--------------+-------------------+
    |   sp   |--------->|              |                   |       
    +--------+          +--------------+                   |     
                        |              |                   |  
                        +--------------+                   | Current Frame  
                        |              |                   |      
    +--------+          +--------------+                   |           
    |   fp   |--------->|        ------|----+              |     
    +--------+          +--------------+<---|--------------+  
                        |              |    |              |   
                        +--------------+    |              |      
                        |              |    |              | Caller's Frame         
                        +--------------+    |              |         
                        |        ------|<---+----+         |        
                        +--------------+<--------|---------+                  
                        |              |         |         |          
                        +--------------+         |         |        
                        |              |         |         | Caller's caller's        
                        +--------------+         |         |      Frame  
                        |              |         |         |        
                        +--------------+         |         |         
                        |        ------|<--------+----+    |          
                        +--------------+<-------------|----+             
                        |              |              |             
                        +--------------+              |           
                             ....                    ... 

```

### Function definitions

When a simple function is called it does not need to allocate anything on stack.

```asm
addFourtyTwo:
  add r0, r0, #42
  bx lr
```

In this case the function doesn't use any *call-preserved* registers, so nothing
need to save on the stack.

But when a function calls another function we need to save & retrieve values 
from the stack.

```asm
.global main
main:
  push {ip, lr}
  ldr r0, =hello
  bl printf
  mov r0, #41
  add r0, r0, #1
  pop {ip, lr}
  bc lr
```

The call to function `printf` will clobber the *call-clobbered* register, so we
need to save those registers (`lr`) on the stack.

When maintaning linked-list of stack frames, We need to push both `lr` & `fp` to
the stack, and then set the new frame pointer to the stack pointer. Using `fp`
makes it easy to deallocate from the stack (`mov sp, fp`).

Setting up & Restoring from the stack is call *prologue* & *epilogue*.

```asm
.global main
main:
  push {fp, lr}  // Function's
  mov fp, sp     // prologue
  ...
  mov sp, fp     // Function's
  pop {fp, lr}   // epilogue
  bx lr
```

Function's prologue saves the call-preserved register & sets up the 
frame pointer, Function's epilogue reverses this and exits the function.

In order to make the function's epilogue shoter we can `pop {fp, pc}`,
because in the epilogue to return from the function we do `bx lr`,
which is the same as `mov pc, lr`. So if we pop the `lr` into `pc` we can
shorten the epilogue (efficitent).

```asm
mov sp, fp   // Function's
pop {fp, pc} // epilogue
```

### Heap

