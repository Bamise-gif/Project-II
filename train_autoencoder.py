import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from tensorflow import keras
from tensorflow.keras import layers
import joblib

df = pd.read_csv("sensor_data.csv")

features = ["temperature", "vibration", "current_draw"]

# Train ONLY on normal (non-anomalous) data — this is the key idea
normal_data = df[df["is_anomaly"] == 0][features]

scaler = StandardScaler()
normal_scaled = scaler.fit_transform(normal_data)

# A small autoencoder: 3 inputs -> compress to 2 -> back out to 3
input_dim = normal_scaled.shape[1]

autoencoder = keras.Sequential([
    layers.Input(shape=(input_dim,)),
    layers.Dense(2, activation="relu"),   # compressed "bottleneck" layer
    layers.Dense(input_dim, activation="linear")  # reconstruction back to original size
])

autoencoder.compile(optimizer="adam", loss="mse")

autoencoder.fit(normal_scaled, normal_scaled, epochs=30, batch_size=32, verbose=1)

# Determine a reconstruction-error threshold using the normal data itself
reconstructed = autoencoder.predict(normal_scaled)
errors = np.mean(np.square(normal_scaled - reconstructed), axis=1)
threshold = np.percentile(errors, 95)  # 95th percentile of normal errors = our cutoff

print(f"\nReconstruction error threshold: {threshold:.4f}")

# Evaluate against the FULL dataset (including real anomalies) to sanity check
all_scaled = scaler.transform(df[features])
all_reconstructed = autoencoder.predict(all_scaled)
all_errors = np.mean(np.square(all_scaled - all_reconstructed), axis=1)
predicted_anomaly = (all_errors > threshold).astype(int)

from sklearn.metrics import classification_report
print(classification_report(df["is_anomaly"], predicted_anomaly, target_names=["Normal", "Anomaly"]))

autoencoder.save("model_autoencoder.keras")
joblib.dump(scaler, "autoencoder_scaler.pkl")
joblib.dump(threshold, "autoencoder_threshold.pkl")

print("\nAutoencoder backup model trained and saved.")