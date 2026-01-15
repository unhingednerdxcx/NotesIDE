@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM ================================
REM NotesIDE Setup Batch File
REM ================================

REM Get the folder where this batch file resides
set "BASEDIR=%~dp0"
echo Base folder: !BASEDIR!

REM -------------------------------
REM 1. Check if Python is installed
REM -------------------------------
where python >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Python 3.x is not installed or not in PATH.
    echo Please download and install Python from:
    echo https://www.python.org/downloads/
    pause
    exit /b 1
) else (
    echo Python found.
)

REM -------------------------------
REM 2. Create virtual environment
REM -------------------------------
if not exist "%BASEDIR%.venv" (
    echo Creating virtual environment...
    python -m venv "%BASEDIR%.venv"
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment.
        pause
        exit /b 1
    )
) else (
    echo Virtual environment already exists.
)

REM -------------------------------
REM 3. Activate virtual environment
REM -------------------------------
call "%BASEDIR%.venv\Scripts\activate.bat"
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment.
    pause
    exit /b 1
)

REM -------------------------------
REM 4. Upgrade pip
REM -------------------------------
echo Upgrading pip...
python -m pip install --upgrade pip
if errorlevel 1 (
    echo WARNING: Failed to upgrade pip.
)

REM -------------------------------
REM 5. Install dependencies from req.txt
REM -------------------------------
set "REQ_FILE=%BASEDIR%req.txt"
if exist "%REQ_FILE%" (
    echo Installing dependencies from req.txt...
    python -m pip install -r "%REQ_FILE%"
    if errorlevel 1 (
        echo WARNING: Some dependencies may have failed to install.
    )
) else (
    echo WARNING: req.txt not found at "%REQ_FILE%".
)

REM -------------------------------
REM Done
REM -------------------------------
echo.
echo Setup complete!
pause
ENDLOCAL
