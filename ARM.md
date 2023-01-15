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
|   add r1, r2, r3  |      Add         | r1 = r2 + r2;   |
|   sum r1, r2, r3  |      Subtract    | r1 = r2 - r3;   |
|   mul r1, r2, r3  |      Multiply    | r1 = r2 * r3;   |
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

+-------------------+------------------+-----------------+
|    Instruction    |     Mnemonic     |      Effect     |
+-------------------+------------------+-----------------+
| mov r1, r2        |       Move       |     r1 = r2;    |
| mvn r1, r2        |     Move-not     |     r1 = ~r2;   |
+-------------------+------------------+-----------------+

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

