@echo off
:Ask
echo Which test case would you like to use (.js file in current directory)?
set INPUT=
set /P INPUT=Enter desired test: %=%
supervisor -q -w .. -i views/,js/ %INPUT% 