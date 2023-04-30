
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
  ldr r0, =16
  bl malloc
  push {r4, ip}
  mov r4, r0
  ldr r0, =3
  str r0, [r4]
  ldr r0, =10
  str r0, [r4, #4]
  ldr r0, =20
  str r0, [r4, #8]
  ldr r0, =30
  str r0, [r4, #12]
  mov r0, r4
  pop {r4, ip}
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
  push {r0, ip}
  ldr r0, =10
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, [fp, #-24]
  push {r0, ip}
  ldr r0, =1
  pop {r1, ip}
  ldr r2, [r1]
  cmp r0, r2
  movhs r0, #0
  addlo r1, r1, #4
  lsllo r0, r0, #2
  ldrlo r0, [r1, r0]
  push {r0, ip}
  ldr r0, =20
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, [fp, #-24]
  push {r0, ip}
  ldr r0, =2
  pop {r1, ip}
  ldr r2, [r1]
  cmp r0, r2
  movhs r0, #0
  addlo r1, r1, #4
  lsllo r0, r0, #2
  ldrlo r0, [r1, r0]
  push {r0, ip}
  ldr r0, =30
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, [fp, #-24]
  push {r0, ip}
  ldr r0, =3
  pop {r1, ip}
  ldr r2, [r1]
  cmp r0, r2
  movhs r0, #0
  addlo r1, r1, #4
  lsllo r0, r0, #2
  ldrlo r0, [r1, r0]
  push {r0, ip}
  mov r0, #0
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, [fp, #-24]
  ldr r0, [r0, #0]
  push {r0, ip}
  ldr r0, =3
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =0
  mov sp, fp
  pop {fp, pc}
  mov sp, fp
  mov r0, #0
  pop {fp, pc}
