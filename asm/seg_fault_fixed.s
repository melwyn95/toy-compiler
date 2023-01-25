hello:
  // .string "Hello, assembly!\0\0\0" // Can also be solved by padding.
  .string "Hello, assembly!"
  .balign 4
.global main
main:
  push {ip, lr}

  ldr r0, =hello
  bl printf

  mov r0, #41
  add r0, r0, #1

  pop {ip, lr}
  bx lr
