#!/usr/bin/env python3
"""
Test the trained model with sample predictions
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ml_model import MultiModalPricePredictor
import numpy as np

def test_model():
    print("\n" + "="*70)
    print("🧪 TESTING PRICE PREDICTION MODEL")
    print("="*70 + "\n")
    
    # Load the trained model
    print("📦 Loading trained model...")
    predictor = MultiModalPricePredictor()
    
    try:
        predictor.load_model("multimodal_price_predictor.pkl")
        print("✅ Model loaded successfully!\n")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        print("   Please train the model first using: python run_training.py")
        return
    
    # Test cases
    test_cases = [
        {
            "name": "Fashion - T-Shirt (Good)",
            "product_type": "Tshirts",
            "description": "Cotton T-Shirt in Blue color with premium quality",
            "features": {
                "gender": "Men",
                "sub_category": "Topwear",
                "color": "Blue",
                "season": "Summer",
                "condition": "Good",
                "product_domain": "Fashion"
            },
            "expected_range": (500, 1500)
        },
        {
            "name": "Fashion - Jeans (Excellent)",
            "product_type": "Jeans",
            "description": "Denim Jeans in Black color premium quality",
            "features": {
                "gender": "Men",
                "sub_category": "Bottomwear",
                "color": "Black",
                "season": "All Season",
                "condition": "Excellent",
                "product_domain": "Fashion"
            },
            "expected_range": (1000, 2500)
        },
        {
            "name": "Electronics - Samsung Phone (Good)",
            "product_type": "Phones",
            "description": "Samsung Galaxy smartphone 128GB storage 6GB RAM dual SIM 48MP camera AMOLED display good condition",
            "features": {
                "gender": "Unisex",
                "sub_category": "Phones",
                "color": "Black",
                "season": "All Season",
                "condition": "Good",
                "product_domain": "Electronics"
            },
            "expected_range": (15000, 30000)
        },
        {
            "name": "Electronics - Dell Laptop (Good)",
            "product_type": "Laptops",
            "description": "Dell Inspiron 15 laptop Intel i5 8GB RAM 256GB SSD Windows 11 15.6 inch display used 1 year",
            "features": {
                "gender": "Unisex",
                "sub_category": "Laptops",
                "color": "Black",
                "season": "All Season",
                "condition": "Good",
                "product_domain": "Electronics"
            },
            "expected_range": (35000, 50000)
        },
        {
            "name": "Electronics - Phone (Poor)",
            "product_type": "Phones",
            "description": "Budget smartphone 64GB storage 4GB RAM dual SIM minor scratches fair condition",
            "features": {
                "gender": "Unisex",
                "sub_category": "Phones",
                "color": "Black",
                "season": "All Season",
                "condition": "Poor",
                "product_domain": "Electronics"
            },
            "expected_range": (5000, 15000)
        },
        {
            "name": "Fashion - Dress (Fair)",
            "product_type": "Dresses",
            "description": "Silk Dress in Red color with premium quality",
            "features": {
                "gender": "Women",
                "sub_category": "Topwear",
                "color": "Red",
                "season": "Summer",
                "condition": "Fair",
                "product_domain": "Fashion"
            },
            "expected_range": (800, 2000)
        }
    ]
    
    print("🔍 Running Test Predictions:\n")
    print(f"{'Test Case':<40} {'Predicted':<15} {'Expected Range':<20} {'Status'}")
    print("-" * 90)
    
    passed = 0
    failed = 0
    
    for test in test_cases:
        try:
            # Use a dummy image path
            image_path = "sample_image.jpg"
            
            predicted_price = predictor.predict_price(
                image_path,
                test["product_type"],
                test["description"],
                test["features"]
            )
            
            min_expected, max_expected = test["expected_range"]
            is_in_range = min_expected <= predicted_price <= max_expected
            status = "✅ PASS" if is_in_range else "⚠️  CHECK"
            
            if is_in_range:
                passed += 1
            else:
                failed += 1
            
            print(f"{test['name']:<40} ₹{predicted_price:>10.2f}   ₹{min_expected:>6.0f}-{max_expected:<6.0f}     {status}")
            
        except Exception as e:
            print(f"{test['name']:<40} ERROR: {str(e)}")
            failed += 1
    
    print("-" * 90)
    print(f"\n📊 Test Results: {passed} passed, {failed} need review out of {len(test_cases)} tests")
    
    accuracy_pct = (passed / len(test_cases)) * 100
    print(f"✨ Test Accuracy: {accuracy_pct:.1f}%")
    
    print("\n" + "="*70)
    print("💡 Note: Predictions may vary based on training data quality")
    print("   For better accuracy, ensure you have sufficient training samples")
    print("="*70 + "\n")

if __name__ == "__main__":
    test_model()
