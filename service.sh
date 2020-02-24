#!/bin/sh
#/etc/init.d/myService
export PATH=$PATH:/usr/local/bin
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules

case "$1" in
start)
exec forever --sourceDir=/home/pi/dgt-cheessboard-bluetooth -p /home/pi/git/dgt-cheessboard-bluetooth server.js  #scriptarguments
;;
stop)
exec forever stop --sourceDir=/home/pi/git/dgt-cheessboard-bluetooth server.js
;;
*)
echo "Usage: /etc/init.d/myService {start|stop}"
exit 1
;;
esac
exit 0