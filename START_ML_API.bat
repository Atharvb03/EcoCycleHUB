@echo off
echo ========================================
echo Starting ML Price Prediction API
echo ========================================
echo.

cd /d "%~dp0\ml_model"

echo Checking if model exists...
if not exist "multimodal_price_predictor.pkl" (
    echo.
    echo ERROR: Model not found!
    echo Please train the model first by running: train_model.bat
    echo.
    pause
    exit /b 1
)

echo Model found! Starting API server...
echo.
echo API will be available at: http://localhost:8000
echo API docs available at: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

.\venv\Scripts\python.exe -m uvicorn ml_api:app --reload --host 0.0.0.0 --port 8000

pause
