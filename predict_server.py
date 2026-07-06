from flask import Flask, request, jsonify
import joblib
import numpy as np
from tensorflow import keras

app = Flask(__name__)

# Primary models
iso_forest = joblib.load("model_isolation_forest.pkl")
xgb_model = joblib.load("model_xgboost.pkl")
rf_model = joblib.load("model_random_forest.pkl")

# Backup models
rf_backup = joblib.load("model_xgboost_backup_rf.pkl")
xgb_backup = joblib.load("model_rf_backup_xgb.pkl")
autoencoder = keras.models.load_model("model_autoencoder.keras")
autoencoder_scaler = joblib.load("autoencoder_scaler.pkl")
autoencoder_threshold = joblib.load("autoencoder_threshold.pkl")

# Measured performance weights, taken from train_models.py evaluation (F1-scores / inverse-MAE)
WEIGHT_XGB_PRIMARY = 0.97
WEIGHT_RF_BACKUP = 0.98
WEIGHT_RF_REG_PRIMARY = 1 / 4.02   # lower MAE = more weight
WEIGHT_XGB_REG_BACKUP = 1 / 3.15


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    temperature = data["temperature"]
    vibration = data["vibration"]
    current_draw = data["current_draw"]
    age_years = data["age_years"]
    days_since_maintenance = data["days_since_maintenance"]

    # ---------- Routine Anomaly Detection: Isolation Forest (primary) + Autoencoder (backup) ----------
    anomaly_input = np.array([[temperature, vibration, current_draw]])
    iso_result = iso_forest.predict(anomaly_input)[0]
    is_anomaly_primary = 1 if iso_result == -1 else 0

    scaled_input = autoencoder_scaler.transform(anomaly_input)
    reconstructed = autoencoder.predict(scaled_input, verbose=0)
    reconstruction_error = np.mean(np.square(scaled_input - reconstructed))
    is_anomaly_backup = 1 if reconstruction_error > autoencoder_threshold else 0

    # Anomaly flag used downstream: primary wins unless it disagrees with backup AND backup is confident
    is_anomaly = bool(is_anomaly_primary or is_anomaly_backup)

    # ---------- Emergency Fault Detection: XGBoost (primary) + Random Forest (backup) ----------
    fault_input = np.array([[temperature, vibration, current_draw, age_years, days_since_maintenance, is_anomaly_primary]])
    xgb_proba = xgb_model.predict_proba(fault_input)[0][1]
    rf_proba = rf_backup.predict_proba(fault_input)[0][1]

    # Weighted ensemble vote
    total_weight = WEIGHT_XGB_PRIMARY + WEIGHT_RF_BACKUP
    fault_probability = (xgb_proba * WEIGHT_XGB_PRIMARY + rf_proba * WEIGHT_RF_BACKUP) / total_weight

    # ---------- Long-term RUL Prediction: Random Forest Regression (primary) + XGBoost Regressor (backup) ----------
    rul_input = np.array([[temperature, vibration, current_draw, age_years, days_since_maintenance]])
    rf_rul = rf_model.predict(rul_input)[0]
    xgb_rul = xgb_backup.predict(rul_input)[0]

    total_reg_weight = WEIGHT_RF_REG_PRIMARY + WEIGHT_XGB_REG_BACKUP
    predicted_rul = (rf_rul * WEIGHT_RF_REG_PRIMARY + xgb_rul * WEIGHT_XGB_REG_BACKUP) / total_reg_weight

    # ---------- Data Classification: route to the most relevant alert type ----------
    if fault_probability > 0.70:
        classification = "Emergency Fault"
    elif is_anomaly and fault_probability <= 0.70:
        classification = "Routine Anomaly"
    elif predicted_rul < 30:
        classification = "Long-term RUL Warning"
    else:
        classification = "Normal"

    return jsonify({
        "is_anomaly": is_anomaly,
        "emergency_fault_probability": round(float(fault_probability) * 100, 1),
        "predicted_days_until_failure": round(float(predicted_rul), 1),
        "classification": classification,
        "model_details": {
            "xgboost_primary_probability": round(float(xgb_proba) * 100, 1),
            "random_forest_backup_probability": round(float(rf_proba) * 100, 1),
            "rf_regression_primary_days": round(float(rf_rul), 1),
            "xgb_regressor_backup_days": round(float(xgb_rul), 1)
        }
    })


if __name__ == "__main__":
    app.run(port=5000)