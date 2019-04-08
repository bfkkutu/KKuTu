@echo off
echo this program was developed by BFKKuTu.Admin(bfk@playts.net).
pause>nul
goto npm

:npm
cls
echo.
echo please enter the name of the module to install.
set /p MD=
npm i -S %MD%
pause>nul