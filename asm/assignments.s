
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

.global assert1234
assert1234:
  push {fp, lr}
  mov fp, sp
  push {r0, r1, r2, r3}
  ldr r0, [fp, #-16]
  push {r0, ip}
  ldr r0, =1
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, [fp, #-12]
  push {r0, ip}
  ldr r0, =2
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, [fp, #-8]
  push {r0, ip}
  ldr r0, =3
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, [fp, #-4]
  push {r0, ip}
  ldr r0, =4
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  mov sp, fp
  mov r0, #0
  pop {fp, pc}

.global main
main:
  push {fp, lr}
  mov fp, sp
  push {r0, r1, r2, r3}
  ldr r0, =1
  bl assert
  ldr r0, =0
  bl assert
  ldr r0, =0
  cmp r0, #0
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =42
  push {r0, ip}
  ldr r0, =4
  push {r0, ip}
  ldr r0, =2
  push {r0, ip}
  ldr r0, =12
  push {r0, ip}
  ldr r0, =2
  pop {r1, ip}
  sub r0, r1, r0
  pop {r1, ip}
  mul r0, r0, r1
  pop {r1, ip}
  add r0, r0, r1
  push {r0, ip}
  ldr r0, =3
  push {r0, ip}
  ldr r0, =5
  push {r0, ip}
  ldr r0, =1
  pop {r1, ip}
  add r0, r0, r1
  pop {r1, ip}
  mul r0, r0, r1
  pop {r1, ip}
  add r0, r0, r1
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =0
  bl assert
  ldr r0, =1
  bl assert
  ldr r0, =97
  bl putchar
  ldr r0, =65
  bl putchar
  ldr r0, =82
  bl putchar
  ldr r0, =77
  bl putchar
  bl rand
  push {r0, ip}
  ldr r0, =42
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #0
  movne r0, #1
  bl assert
  ldr r0, =1
  cmp r0, #0
  beq .L2
  ldr r0, =73
  bl putchar
  b .L3
.L2:
  ldr r0, =69
  bl putchar
.L3:
  ldr r0, =0
  cmp r0, #0
  beq .L4
  ldr r0, =73
  bl putchar
  b .L5
.L4:
  ldr r0, =69
  bl putchar
.L5:
  ldr r0, =10
  bl putchar
  ldr r0, =9
  bl putchar
  ldr r0, =72
  bl putchar
  ldr r0, =10
  bl putchar
  sub sp, sp, #16
  ldr r0, =1
  str r0, [sp, #0]
  ldr r0, =2
  str r0, [sp, #4]
  ldr r0, =3
  str r0, [sp, #8]
  ldr r0, =4
  str r0, [sp, #12]
  pop {r0, r1, r2, r3}
  bl assert1234
  ldr r0, =4
  push {r0, ip}
  ldr r0, =2
  push {r0, ip}
  ldr r0, =12
  push {r0, ip}
  ldr r0, =2
  pop {r1, ip}
  sub r0, r1, r0
  pop {r1, ip}
  mul r0, r0, r1
  pop {r1, ip}
  add r0, r0, r1
  push {r0, ip}
  ldr r0, =3
  push {r0, ip}
  ldr r0, =5
  push {r0, ip}
  ldr r0, =1
  pop {r1, ip}
  add r0, r0, r1
  pop {r1, ip}
  mul r0, r0, r1
  push {r0, ip}
  ldr r0, [fp, #-24]
  push {r0, ip}
  ldr r0, [fp, #-32]
  pop {r1, ip}
  add r0, r0, r1
  push {r0, ip}
  ldr r0, [fp, #-40]
  push {r0, ip}
  ldr r0, =42
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =1
  push {r0, ip}
  ldr r0, [fp, #-48]
  push {r0, ip}
  ldr r0, =1
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =0
  str r0, [fp, #-48]
  ldr r0, [fp, #-48]
  push {r0, ip}
  ldr r0, =0
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  mov sp, fp
  mov r0, #0
  pop {fp, pc}
