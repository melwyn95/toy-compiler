.global main
main:
  push {fp, lr}
  ldr r0, =1
  cmp r0, #1
  moveq r0, #'.'
  movne r0, #'F'
  bl putchar
  ldr r0, =0
  cmp r0, #1
  moveq r0, #'.'
  movne r0, #'F'
  bl putchar
  ldr r0, =0
  cmp r0, #0
  moveq r0, #1
  movne r0, #0
  cmp r0, #1
  moveq r0, #'.'
  movne r0, #'F'
  bl putchar
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
  cmp r0, #1
  moveq r0, #'.'
  movne r0, #'F'
  bl putchar
  ldr r0, =0
  cmp r0, #1
  moveq r0, #'.'
  movne r0, #'F'
  bl putchar
  ldr r0, =1
  cmp r0, #1
  moveq r0, #'.'
  movne r0, #'F'
  bl putchar
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
  cmp r0, #1
  moveq r0, #'.'
  movne r0, #'F'
  bl putchar
  ldr r0, =1
  cmp r0, #0
  beq .L0
  ldr r0, =73
  bl putchar
  b .L1
.L0:
  ldr r0, =69
  bl putchar
.L1:
  ldr r0, =0
  cmp r0, #0
  beq .L2
  ldr r0, =73
  bl putchar
  b .L3
.L2:
  ldr r0, =69
  bl putchar
.L3:
  ldr r0, =10
  bl putchar
  ldr r0, =9
  bl putchar
  ldr r0, =72
  bl putchar
  ldr r0, =10
  bl putchar
  mov r0, #0
  pop {fp, pc}
