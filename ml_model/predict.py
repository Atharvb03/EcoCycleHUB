import sys
import json
import random

try:
    name = sys.argv[1]
    description = sys.argv[2]
    category = sys.argv[3]
    subCategory = sys.argv[4]
except IndexError:
    print(json.dumps({"error": "Missing input arguments"}))
    sys.exit(1)

# Simulated prediction
predicted_price = random.uniform(20, 5000)
formatted_price = f"{predicted_price:.2f}"  # Always exactly 2 decimals

# Send response as JSON (string value)
print(json.dumps({"predicted_price": formatted_price}))
sys.exit(0)
