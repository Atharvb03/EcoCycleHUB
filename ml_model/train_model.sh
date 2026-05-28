#!/bin/bash

echo "========================================"
echo "ML Model Training Script"
echo "========================================"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Check Python installation
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 is not installed or not in PATH"
    exit 1
fi

python3 --version
echo ""

# Start training
echo "Starting model training..."
echo "This may take 5-10 minutes depending on your system."
echo ""

python3 run_training.py

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Training failed. Check the error messages above."
    exit 1
fi

echo ""
echo "========================================"
echo "Training completed successfully!"
echo "========================================"
echo ""
echo "Running test predictions..."
echo ""

python3 test_predictions.py

echo ""
echo "========================================"
echo "All done! You can now restart the ML API."
echo "========================================"
