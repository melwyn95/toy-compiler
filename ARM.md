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
of time the operand must be shifted.

+-------------+--+---------+---------+---------+---------+-----------------+
|1 1 1 0 0 0 1 0 | 1 0 0 0 | 0 0 1 0 | 0 0 0 1 | 0 0 1 0 | 1 1 1 1 1 0 1 0 |
+-------------+--+---------+---------+---------+---------+-----------------+
              ^            ^         ^         ^         ^                 ^
              |     add    |    r2   |    r1   |  shift  |       0xFA      |  
              +------------+---------+---------+---------+-----------------+

