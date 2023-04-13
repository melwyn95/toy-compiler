
.global assert
assert:
  push {fp, lr}
  mov fp, sp
  push {r0, r1, r2, r3}
  ldr r0, [fp, #-16]
  cmp r0, #0
  beq .L0
  ldr r0, =46
  bl putchar
  b .L1
.L0:
  ldr r0, =70
  bl putchar
.L1:
  mov sp, fp
  mov r0, #0
  pop {fp, pc}

.global main
main:
  push {fp, lr}
  mov fp, sp
  push {r0, r1, r2, r3}
  mov r0, #1
  bl assert
  mov r0, #0
  bl assert
  mov r0, #0
  cmp r0, #0
  moveq r0, #1
  movne r0, #0
  bl assert
  mov r0, #0
  bl assert
  ldr r0, =0
  mov sp, fp
  pop {fp, pc}
  mov sp, fp
  mov r0, #0
  pop {fp, pc}
