o=$(echo $1 | sed s/./_/g)
arm-linux-gnueabihf-gcc -static $1 -o $o
qemu-arm $o
echo "Exit code = $?"
rm $o