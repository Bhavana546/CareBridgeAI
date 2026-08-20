import pandas as pd
from pathlib import Path

# Path to the data folder
DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# List of all dataset files
files = [
    "hospitals.csv",
    "hospital_specialties.csv",
    "procedures.csv",
    "hospital_procedures.csv",
    "hospital_rooms.csv",
    "insurance_policies.csv",
    "coverage_rules.csv"
]

# Read and display each dataset
for file in files:
    file_path = DATA_DIR / file
    df = pd.read_csv(file_path)

    print(f"\n{'=' * 50}")
    print(f"{file}")
    print(f"Rows: {len(df)}")
    print(df.head())