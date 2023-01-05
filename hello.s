/* Hello-world program.
   Print "Hello, assembly!" and exit with code 42. */
.data
  hello:
    .string "Hello, assembly!\n"

.text
  .global main
  main:
    push {ip, lr}
    
    ldr r0, =hello
    bl printf
    
    mov r0, #41
    add r0, r0, #1 // Increment
    
    pop {ip, lr}
    bx lr
