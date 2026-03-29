@echo off
title Pixel OS Horror

echo.
echo  ============================================
echo   Pixel OS Horror - Server Start
echo  ============================================
echo.

set ROOT=%~dp0
set FRONTEND=%ROOT%frontend
set BACKEND=%ROOT%backend

if not defined JAVA_HOME (
    set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot
)
set PATH=%JAVA_HOME%\bin;%PATH%

echo [1/4] Stopping existing processes...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 "') do (
    taskkill /PID %%a /F > nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8080 "') do (
    taskkill /PID %%a /F > nul 2>&1
)
echo    Done.
echo.

echo [2/4] Checking Java and npm...

java -version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo  [ERROR] Java not found. Please install JDK 17+.
    echo          https://adoptium.net/
    pause
    exit /b 1
)
echo    Java OK.

call npm -v > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo  [ERROR] Node.js / npm not found.
    echo          https://nodejs.org/
    pause
    exit /b 1
)
echo    npm OK.
echo.

echo [3/4] Starting Backend (Spring Boot :8080)...
start "Backend" cmd /k "cd /d %BACKEND% && call gradlew.bat bootRun"

echo    Waiting 15 seconds for Spring Boot...
timeout /t 15 /nobreak > nul

echo [4/4] Starting Frontend (Vite :5173)...
if not exist "%FRONTEND%\node_modules" (
    echo    Running npm install first...
    start "Frontend" cmd /k "cd /d %FRONTEND% && call npm install && call npm run dev"
) else (
    start "Frontend" cmd /k "cd /d %FRONTEND% && call npm run dev"
)

timeout /t 3 /nobreak > nul
start chrome http://localhost:5173

echo.
echo  ============================================
echo   Started!
echo   Frontend  : http://localhost:5173
echo   Backend   : http://localhost:8080
echo   H2 Console: http://localhost:8080/h2-console
echo  ============================================
echo.
pause
