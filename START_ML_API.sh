#!/bin/bash

echo "========================================"
echo "Starting ML Price Prediction API"
echo "========================================"
echo ""

cd "$(dirname "$0")/ml_model"

echo "Checking if model exists..."
if [ ! -f "multimodal_price_predictor.pkl" ]; then
    echo ""
    echo "ERROR: Model not found!"
    echo "Please train the model first by running: ./train_model.sh"
    echo ""
    exit 1
fi

echo "Model found! Starting API server..."
echo ""
echo "API will be available at: http://localhost:8000"
echo "API docs available at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m uvicorn ml_api:app --reload --host 0.0.0.0 --port 8000
