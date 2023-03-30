
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

.global factorial
factorial:
  push {fp, lr}
  mov fp, sp
  push {r0, r1, r2, r3}
  ldr r0, =1
  push {r0, ip}
.L2:
  ldr r0, [fp, #-16]
  push {r0, ip}
  ldr r0, =0
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #0
  movne r0, #1
  cmp r0, #0
  beq .L3
  ldr r0, [fp, #-24]
  push {r0, ip}
  ldr r0, [fp, #-16]
  pop {r1, ip}
  mul r0, r0, r1
  str r0, [fp, #-24]
  ldr r0, [fp, #-16]
  push {r0, ip}
  ldr r0, =1
  pop {r1, ip}
  sub r0, r1, r0
  str r0, [fp, #-16]
  b .L2
.L3:
  ldr r0, [fp, #-24]
  mov sp, fp
  pop {fp, pc}
  mov sp, fp
  mov r0, #0
  pop {fp, pc}

.global main
main:
  push {fp, lr}
  mov fp, sp
  push {r0, r1, r2, r3}
  ldr r0, =1
  push {r0, ip}
  ldr r0, =1
  bl factorial
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =1
  push {r0, ip}
  ldr r0, =1
  bl factorial
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =2
  push {r0, ip}
  ldr r0, =2
  bl factorial
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =6
  push {r0, ip}
  ldr r0, =3
  bl factorial
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =24
  push {r0, ip}
  ldr r0, =4
  bl factorial
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =120
  push {r0, ip}
  ldr r0, =5
  bl factorial
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =720
  push {r0, ip}
  ldr r0, =6
  bl factorial
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =5040
  push {r0, ip}
  ldr r0, =7
  bl factorial
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =40320
  push {r0, ip}
  ldr r0, =8
  bl factorial
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =362880
  push {r0, ip}
  ldr r0, =9
  bl factorial
  pop {r1, ip}
  cmp r0, r1
  moveq r0, #1
  movne r0, #0
  bl assert
  ldr r0, =3628800
  push {r0, ip}
  ldr r0, =10
  bl factorial
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
