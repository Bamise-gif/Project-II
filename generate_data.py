import pandas as pd
import numpy as np

np.random.seed(42)  # makes results reproducible — same "random" data every run

NUM_ASSETS = 50
NUM_DAYS = 90

rows = []

for asset_id in range(1, NUM_ASSETS + 1):
    age_years = np.random.randint(1, 20)
    baseline_temp = np.random.normal(45, 3)       # normal operating temp, in Celsius
    baseline_vibration = np.random.normal(2.0, 0.3)
    baseline_current = np.random.normal(15, 1.5)

    # 20% of assets are designed to degrade toward failure
    will_fail = np.random.rand() < 0.2
    failure_day = np.random.randint(40, NUM_DAYS) if will_fail else None

    days_since_maintenance = np.random.randint(0, 60)

    for day in range(NUM_DAYS):
        if will_fail and day >= failure_day - 20:
            # degrading: temp/vibration rise steadily as failure_day approaches
            progress = (day - (failure_day - 20)) / 20
            temp = baseline_temp + progress * 25 + np.random.normal(0, 1)
            vibration = baseline_vibration + progress * 3 + np.random.normal(0, 0.2)
            current = baseline_current + progress * 5 + np.random.normal(0, 0.5)
        else:
            # normal operation: small random noise only
            temp = baseline_temp + np.random.normal(0, 1.5)
            vibration = baseline_vibration + np.random.normal(0, 0.15)
            current = baseline_current + np.random.normal(0, 0.8)

        is_anomaly = 1 if (temp > baseline_temp + 10 or vibration > baseline_vibration + 1.5) else 0
        is_emergency_fault = 1 if (will_fail and day >= failure_day - 5) else 0

        if will_fail:
            days_until_failure = max(failure_day - day, 0)
        else:
            days_until_failure = 999  # large number = "not failing soon"

        rows.append({
            "asset_id": asset_id,
            "day": day,
            "age_years": age_years,
            "days_since_maintenance": days_since_maintenance + day,
            "temperature": round(temp, 2),
            "vibration": round(vibration, 3),
            "current_draw": round(current, 2),
            "is_anomaly": is_anomaly,
            "is_emergency_fault": is_emergency_fault,
            "days_until_failure": days_until_failure
        })

df = pd.DataFrame(rows)
df.to_csv("sensor_data.csv", index=False)
print(f"Generated {len(df)} rows across {NUM_ASSETS} assets.")
print(df.head())