#!/usr/bin/env python3
"""
Enhanced ML Model Training Script
Trains the price prediction model and displays accuracy metrics
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from train_enhanced import train_and_save

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🎯 PRICE PREDICTION MODEL TRAINING")
    print("="*70 + "\n")
    
    try:
        predictor = train_and_save()
        
        if predictor:
            print("\n" + "="*70)
            print("✅ TRAINING COMPLETED SUCCESSFULLY!")
            print("="*70)
            print("\n📝 Next Steps:")
            print("   1. Restart the ML API server: python ml_api.py")
            print("   2. Test predictions through the admin panel")
            print("   3. Monitor prediction accuracy in production")
            print("\n" + "="*70 + "\n")
        else:
            print("\n❌ Training failed. Check error messages above.")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ Error during training: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
