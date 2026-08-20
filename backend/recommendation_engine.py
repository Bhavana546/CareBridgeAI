import pandas as pd
from pathlib import Path


# ==========================================
# LOAD DATASETS
# ==========================================

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

hospitals = pd.read_csv(DATA_DIR / "hospitals.csv")
specialties = pd.read_csv(DATA_DIR / "hospital_specialties.csv")
procedures = pd.read_csv(DATA_DIR / "procedures.csv")
hospital_procedures = pd.read_csv(
    DATA_DIR / "hospital_procedures.csv"
)
hospital_rooms = pd.read_csv(
    DATA_DIR / "hospital_rooms.csv"
)
policies = pd.read_csv(
    DATA_DIR / "insurance_policies.csv"
)
coverage_rules = pd.read_csv(
    DATA_DIR / "coverage_rules.csv"
)


print("All recommendation datasets loaded successfully!")


# ==========================================
# GET HOSPITALS FOR PROCEDURE
# ==========================================

def get_hospitals_for_procedure(procedure_id):

    eligible = hospital_procedures[
        hospital_procedures["procedure_id"] == procedure_id
    ]

    if eligible.empty:
        return pd.DataFrame()

    result = eligible.merge(
        hospitals,
        on="hospital_id",
        how="left"
    )

    return result


# ==========================================
# GET POLICY COVERAGE
# ==========================================

def get_policy_coverage(
    policy_id,
    procedure_id
):

    coverage = coverage_rules[
        (coverage_rules["policy_id"] == policy_id)
        &
        (coverage_rules["procedure_id"] == procedure_id)
    ]

    if coverage.empty:
        return None

    return coverage.iloc[0]


# ==========================================
# GET POLICY DETAILS
# ==========================================

def get_policy_details(policy_id):

    policy = policies[
        policies["policy_id"] == policy_id
    ]

    if policy.empty:
        return None

    return policy.iloc[0]


# ==========================================
# CALCULATE ESTIMATED COST
# ==========================================

def calculate_estimated_cost(
    policy_id,
    procedure_id,
    procedure_cost
):

    policy = get_policy_details(policy_id)

    coverage = get_policy_coverage(
        policy_id,
        procedure_id
    )

    if policy is None or coverage is None:
        return None

    if str(coverage["covered"]).strip().lower() != "yes":
        return None

    coverage_limit = coverage["coverage_limit"]

    copay_percent = policy["copay_percent"]

    deductible = policy["deductible"]


    # Maximum amount covered
    covered_base = min(
        procedure_cost,
        coverage_limit
    )


    # Patient co-pay
    copay_amount = (
        covered_base * (copay_percent / 100)
    )


    # Insurance contribution
    insurance_amount = (
        covered_base - copay_amount
    )


    # Remaining patient contribution
    patient_amount = (
        (procedure_cost - covered_base)
        + copay_amount
        + deductible
    )


    return {
        "procedure_cost": float(procedure_cost),

        "coverage_limit": float(coverage_limit),

        "copay_amount": round(
            float(copay_amount),
            2
        ),

        "deductible": float(deductible),

        "estimated_insurance_amount": round(
            float(insurance_amount),
            2
        ),

        "estimated_patient_amount": round(
            float(patient_amount),
            2
        )
    }


# ==========================================
# CHECK ROOM ELIGIBILITY
# ==========================================

def check_room_eligibility(
    policy_id,
    hospital_id
):

    policy = get_policy_details(policy_id)

    if policy is None:
        return False

    eligible_room = str(
        policy["room_eligibility"]
    ).strip()


    available_rooms = hospital_rooms[
        hospital_rooms["hospital_id"]
        == hospital_id
    ]


    if available_rooms.empty:
        return False


    room_types = (
        available_rooms["room_type"]
        .astype(str)
        .str.strip()
        .values
    )


    return eligible_room in room_types


# ==========================================
# CALCULATE RECOMMENDATION SCORE
# ==========================================

def calculate_recommendation_score(
    patient_amount,
    room_eligible,
    max_patient_amount
):

    # Lower patient cost = higher score
    if max_patient_amount > 0:

        cost_score = (
            1 -
            (patient_amount / max_patient_amount)
        ) * 70

    else:
        cost_score = 70


    # Room eligibility = 30 points
    room_score = (
        30 if room_eligible else 0
    )


    total_score = (
        cost_score + room_score
    )


    return round(total_score, 2)


# ==========================================
# RECOMMEND HOSPITALS
# ==========================================

def recommend_hospitals(
    policy_id,
    procedure_id
):

    # Check whether policy exists
    policy = get_policy_details(policy_id)

    if policy is None:
        return []


    # Check whether procedure exists
    procedure = procedures[
        procedures["procedure_id"]
        == procedure_id
    ]

    if procedure.empty:
        return []


    # Check coverage before processing hospitals
    coverage = get_policy_coverage(
        policy_id,
        procedure_id
    )


    if coverage is None:
        return []


    # Check if procedure is covered
    if (
        str(coverage["covered"])
        .strip()
        .lower()
        != "yes"
    ):
        return []


    # Get hospitals performing procedure
    hospitals_for_procedure = (
        get_hospitals_for_procedure(
            procedure_id
        )
    )


    if hospitals_for_procedure.empty:
        return []


    recommendations = []


    # Process each hospital
    for _, hospital in (
        hospitals_for_procedure.iterrows()
    ):

        procedure_cost = hospital.get(
            "estimated_cost"
        )


        # Skip invalid costs
        if pd.isna(procedure_cost):
            continue


        cost_estimate = (
            calculate_estimated_cost(
                policy_id,
                procedure_id,
                procedure_cost
            )
        )


        if cost_estimate is None:
            continue


        room_eligible = (
            check_room_eligibility(
                policy_id,
                hospital["hospital_id"]
            )
        )


        recommendations.append({

            "hospital_id":
                hospital["hospital_id"],

            "hospital_name":
                hospital["hospital_name"],

            "city":
                hospital["city"],

            "procedure_cost":
                float(procedure_cost),

            "room_eligible":
                bool(room_eligible),

            "estimated_insurance_amount":
                cost_estimate[
                    "estimated_insurance_amount"
                ],

            "estimated_patient_amount":
                cost_estimate[
                    "estimated_patient_amount"
                ]

        })


    # IMPORTANT:
    # Prevent max() error when no hospitals
    # are eligible for recommendation
    if not recommendations:
        return []


    # Find highest patient contribution
    max_patient_amount = max(
        hospital["estimated_patient_amount"]
        for hospital in recommendations
    )


    # Calculate score for every hospital
    for hospital in recommendations:

        hospital[
            "recommendation_score"
        ] = calculate_recommendation_score(

            hospital[
                "estimated_patient_amount"
            ],

            hospital[
                "room_eligible"
            ],

            max_patient_amount
        )


    # Sort highest score first
    recommendations.sort(

        key=lambda hospital:
            hospital["recommendation_score"],

        reverse=True
    )


    return recommendations