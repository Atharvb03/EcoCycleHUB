@echo off
echo ========================================
echo ML Model Training Script
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Starting model training...
echo This may take 5-10 minutes depending on your system.
echo.

python run_training.py

if errorlevel 1 (
    echo.
    echo ERROR: Training failed. Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Training completed successfully!
echo ========================================
echo.
echo Running test predictions...
echo.

python test_predictions.py

echo.
echo ========================================
echo All done! You can now restart the ML API.
echo ========================================
pause
