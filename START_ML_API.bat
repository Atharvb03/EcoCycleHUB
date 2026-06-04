@echo off
echo ========================================
echo  EcoCycleHUB - ML Price Prediction API
echo ========================================
echo.

cd /d "%~dp0\ml_model"

echo Checking models...
if not exist "electronics_price_model.pkl" (
    echo ERROR: electronics_price_model.pkl not found.
    echo Run: python train_electronics.py
    pause
    exit /b 1
)
if not exist "fashion_price_model.pkl" (
    echo ERROR: fashion_price_model.pkl not found.
    echo Run: python train_fashion.py
    pause
    exit /b 1
)

echo Models found! Starting API server...
echo.
echo API running at : http://localhost:8001
echo API docs       : http://localhost:8001/docs
echo.
echo Press Ctrl+C to stop.
echo.

python -m uvicorn ml_api:app --reload --host 0.0.0.0 --port 8001

pause
