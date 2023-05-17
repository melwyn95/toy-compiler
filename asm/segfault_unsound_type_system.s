
.global wrongReturnType
wrongReturnType:
  push {fp, lr}
  mov fp, sp
  push {r0, r1, r2, r3}
  ldr r0, [fp, #-16]
  cmp r0, #0
  beq .L0
  ldr r0, =8
  bl malloc
  push {r4, ip}
  mov r4, r0
  ldr r0, =1
  str r0, [r4]
  ldr r0, =42
  str r0, [r4, #4]
  mov r0, r4
  pop {r4, ip}
  mov sp, fp
  pop {fp, pc}
  b .L1
.L0:
.L1:
  mov sp, fp
  mov r0, #0
  pop {fp, pc}

.global main
main:
  push {fp, lr}
  mov fp, sp
  push {r0, r1, r2, r3}
  mov r0, #0
  bl wrongReturnType
  push {r0, ip}
  ldr r0, [fp, #-24]
  push {r0, ip}
  ldr r0, =0
  pop {r1, ip}
  ldr r2, [r1]
  cmp r0, r2
  movhs r0, #0
  addlo r1, r1, #4
  lsllo r0, r0, #2
  ldrlo r0, [r1, r0]
  mov sp, fp
  mov r0, #0
  pop {fp, pc}
