import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_absolute_error
import xgboost as xgb
import joblib

df = pd.read_csv("sensor_data.csv")

# ---------- MODEL 1: Isolation Forest (Routine Anomaly Detection) ----------
print("\n=== Isolation Forest ===")

anomaly_features = ["temperature", "vibration", "current_draw"]
X_anomaly = df[anomaly_features]

iso_forest = IsolationForest(contamination=0.07, random_state=42)
iso_forest.fit(X_anomaly)

# IsolationForest outputs -1 for anomaly, 1 for normal — convert to 1/0 to match our labels
df["iso_prediction"] = (iso_forest.predict(X_anomaly) == -1).astype(int)

print(classification_report(df["is_anomaly"], df["iso_prediction"], target_names=["Normal", "Anomaly"]))

joblib.dump(iso_forest, "model_isolation_forest.pkl")

# ---------- MODEL 2: XGBoost (Emergency Fault Detection) ----------
print("\n=== XGBoost ===")

fault_features = ["temperature", "vibration", "current_draw", "age_years", "days_since_maintenance", "is_anomaly"]
X_fault = df[fault_features]
y_fault = df["is_emergency_fault"]

X_train, X_test, y_train, y_test = train_test_split(X_fault, y_fault, test_size=0.2, random_state=42)

xgb_model = xgb.XGBClassifier(n_estimators=100, max_depth=4, random_state=42)
xgb_model.fit(X_train, y_train)

y_pred = xgb_model.predict(X_test)
print(classification_report(y_test, y_pred, target_names=["No Fault", "Emergency Fault"]))

joblib.dump(xgb_model, "model_xgboost.pkl")

# ---------- MODEL 2b: Random Forest (Emergency Fault Detection — BACKUP) ----------
print("\n=== Random Forest (Backup for Emergency Fault Detection) ===")

rf_classifier = RandomForestClassifier(n_estimators=100, max_depth=4, random_state=42)
rf_classifier.fit(X_train, y_train)

y_pred_backup = rf_classifier.predict(X_test)
print(classification_report(y_test, y_pred_backup, target_names=["No Fault", "Emergency Fault"]))

joblib.dump(rf_classifier, "model_xgboost_backup_rf.pkl")

# ---------- MODEL 3: Random Forest Regression (Long-term RUL Prediction) ----------
print("\n=== Random Forest Regression ===")

degrading_df = df[df["days_until_failure"] < 999]  # only assets actually on a failure trajectory

rul_features = ["temperature", "vibration", "current_draw", "age_years", "days_since_maintenance"]
X_rul = degrading_df[rul_features]
y_rul = degrading_df["days_until_failure"]

X_train, X_test, y_train, y_test = train_test_split(X_rul, y_rul, test_size=0.2, random_state=42)

rf_model = RandomForestRegressor(n_estimators=150, max_depth=8, random_state=42)
rf_model.fit(X_train, y_train)

y_pred = rf_model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
print(f"Mean Absolute Error: {mae:.2f} days")

joblib.dump(rf_model, "model_random_forest.pkl")

# ---------- MODEL 3b: XGBoost Regressor (RUL Prediction — BACKUP) ----------
print("\n=== XGBoost Regressor (Backup for RUL Prediction) ===")

xgb_regressor = xgb.XGBRegressor(n_estimators=150, max_depth=6, random_state=42)
xgb_regressor.fit(X_train, y_train)

y_pred_backup = xgb_regressor.predict(X_test)
mae_backup = mean_absolute_error(y_test, y_pred_backup)
print(f"Mean Absolute Error (backup): {mae_backup:.2f} days")

joblib.dump(xgb_regressor, "model_rf_backup_xgb.pkl")

print("\nAll models trained and saved.")