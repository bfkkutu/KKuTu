@echo off
echo this program was developed by BFKKuTu.Admin(bfk@playts.net).
pause>nul
goto npm

:npm
cls
echo.
echo please enter the name of the module to uninstall.
set /p MD=
npm uninstall -S %MD%
pause>nul