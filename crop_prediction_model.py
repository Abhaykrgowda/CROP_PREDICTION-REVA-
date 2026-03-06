import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Load dataset
df = pd.read_csv("crop_recommendation.csv")

# Features and labels
X = df.drop("label", axis=1)
y = df["label"]

# Train test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Evaluate model
y_pred = model.predict(X_test)
print("Model Accuracy:", accuracy_score(y_test, y_pred))


print("\nEnter soil and climate details")

N = float(input("Nitrogen (N): "))
P = float(input("Phosphorus (P): "))
K = float(input("Potassium (K): "))
temperature = float(input("Temperature (°C): "))
humidity = float(input("Humidity (%): "))
ph = float(input("pH value: "))
rainfall = float(input("Rainfall (mm): "))

# Create input array
input_data = [[N, P, K, temperature, humidity, ph, rainfall]]

# Get probabilities
probs = model.predict_proba(input_data)[0]

# Crop names
crops = model.classes_

# Top 3 crops
top3_idx = np.argsort(probs)[-3:][::-1]

print("\nTop 3 Recommended Crops:\n")

for rank, i in enumerate(top3_idx, 1):
    if probs[i] > 0:
        print(f"{rank}. {crops[i]} : {probs[i]*100:.2f}%")
