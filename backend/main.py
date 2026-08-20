from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import recommendation_engine as engine
import fitz
import re


app = FastAPI(
    title="CareBridge AI API",
    version="1.0.0"
)


# Enable frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://bhavana546.github.io",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "CareBridge AI Backend is Running"
    }


# Hospital recommendation endpoint
@app.get("/recommend")
def get_recommendations(
    policy_id: str,
    procedure_id: str
):

    try:

        # Check whether policy exists
        policy_exists = policy_id in engine.policies[
            "policy_id"
        ].values

        if not policy_exists:
            raise HTTPException(
                status_code=404,
                detail=f"Policy {policy_id} was not found"
            )

        # Check whether procedure exists
        procedure_exists = procedure_id in engine.procedures[
            "procedure_id"
        ].values

        if not procedure_exists:
            raise HTTPException(
                status_code=404,
                detail=f"Procedure {procedure_id} was not found"
            )

        # Get recommendations
        recommendations = engine.recommend_hospitals(
            policy_id,
            procedure_id
        )

        return {
            "policy_id": policy_id,
            "procedure_id": procedure_id,
            "recommendations": recommendations,
            "disclaimer": (
                "All results are illustrative estimates "
                "based on synthetic prototype data."
            )
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            "Recommendation Error:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Error generating hospital recommendations: "
                f"{str(error)}"
            )
        )


# Get available insurance policies
@app.get("/policies")
def get_policies():

    policy_list = engine.policies[
        [
            "policy_id",
            "insurer_name",
            "policy_name"
        ]
    ].to_dict(
        orient="records"
    )

    return {
        "policies": policy_list
    }
# Compare two insurance policies
@app.get("/policy-compare")
def compare_policies(
    policy1: str,
    policy2: str
):

    try:

        # Find first policy
        first_policy = engine.policies[
            engine.policies["policy_id"] == policy1
        ]

        # Find second policy
        second_policy = engine.policies[
            engine.policies["policy_id"] == policy2
        ]

        # Check first policy
        if first_policy.empty:
            raise HTTPException(
                status_code=404,
                detail=f"Policy {policy1} was not found"
            )

        # Check second policy
        if second_policy.empty:
            raise HTTPException(
                status_code=404,
                detail=f"Policy {policy2} was not found"
            )

        # Convert rows to dictionaries
        first_policy_data = (
            first_policy.iloc[0].to_dict()
        )

        second_policy_data = (
            second_policy.iloc[0].to_dict()
        )

        return {
            "policy1": first_policy_data,
            "policy2": second_policy_data
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            "Policy Comparison Error:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Error comparing insurance policies: "
                f"{str(error)}"
            )
        )

# Get available medical procedures
@app.get("/procedures")
def get_procedures():

    procedure_list = engine.procedures[
        [
            "procedure_id",
            "procedure_name",
            "specialty"
        ]
    ].to_dict(
        orient="records"
    )

    return {
        "procedures": procedure_list
    }


# Extract policy details from uploaded PDF text
def extract_policy_details(text: str):

    policy_id = re.search(
        r"Policy ID\s*[:\n]\s*([A-Za-z0-9]+)",
        text
    )

    policy_name = re.search(
        r"Policy Name\s*[:\n]\s*(.+)",
        text
    )

    insurer = re.search(
        r"Insurer\s*[:\n]\s*(.+)",
        text
    )

    coverage_limit = re.search(
        r"Coverage Limit\s*[:\n]\s*[₹Rs.\s]*([\d,]+)",
        text
    )

    deductible = re.search(
        r"Deductible\s*[:\n]\s*[₹Rs.\s]*([\d,]+)",
        text
    )

    copay = re.search(
        r"Co-pay\s*[:\n]\s*(\d+)",
        text
    )

    room = re.search(
        r"Room Eligibility\s*[:\n]\s*(.+)",
        text
    )

    return {

        "policy_id": (
            policy_id.group(1)
            if policy_id else None
        ),

        "policy_name": (
            policy_name.group(1).strip()
            if policy_name else None
        ),

        "insurer": (
            insurer.group(1).strip()
            if insurer else None
        ),

        "coverage_limit": (
            int(
                coverage_limit.group(1).replace(",", "")
            )
            if coverage_limit else None
        ),

        "deductible": (
            int(
                deductible.group(1).replace(",", "")
            )
            if deductible else None
        ),

        "copay_percent": (
            int(copay.group(1))
            if copay else None
        ),

        "room_eligibility": (
            room.group(1).strip()
            if room else None
        )
    }


# Upload and process insurance policy PDF
@app.post("/upload-policy")
async def upload_policy(
    file: UploadFile = File(...)
):

    # Check whether file exists
    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file uploaded"
        )

    # Allow only PDF files
    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    try:

        # Read uploaded PDF
        pdf_bytes = await file.read()

        # Open PDF from memory
        pdf_document = fitz.open(
            stream=pdf_bytes,
            filetype="pdf"
        )

        # Store page count
        page_count = len(pdf_document)

        # Extract text
        extracted_text = ""

        for page in pdf_document:

            extracted_text += page.get_text()

        # Close PDF
        pdf_document.close()

        # Check whether readable text exists
        if not extracted_text.strip():

            raise HTTPException(
                status_code=400,
                detail=(
                    "No readable text was found in this PDF. "
                    "The document may be scanned or image-based."
                )
            )

        # Extract structured policy details
        extracted_policy = extract_policy_details(
            extracted_text
        )

        # Return result
        return {

            "message": (
                "Insurance policy uploaded and "
                "processed successfully"
            ),

            "filename": file.filename,

            "pages": page_count,

            "text_length": len(extracted_text),

            "extracted_policy": extracted_policy,

            "text_preview": extracted_text[:2000]
        }


    except HTTPException:
        raise


    except Exception as error:

        print(
            "PDF Processing Error:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Error processing PDF: "
                f"{str(error)}"
            )
        )
    # Check whether a procedure is covered by an insurance policy
@app.get("/check-coverage")
def check_coverage(
    policy_id: str,
    procedure_id: str
):

    try:

        # Check whether policy exists
        policy = engine.get_policy_details(policy_id)

        if policy is None:
            raise HTTPException(
                status_code=404,
                detail=f"Policy {policy_id} was not found"
            )

        # Check whether procedure exists
        procedure = engine.procedures[
            engine.procedures["procedure_id"] == procedure_id
        ]

        if procedure.empty:
            raise HTTPException(
                status_code=404,
                detail=f"Procedure {procedure_id} was not found"
            )

        # Get coverage information
        coverage = engine.get_policy_coverage(
            policy_id,
            procedure_id
        )

        # Procedure is not listed in coverage rules
        if coverage is None:

            return {
                "policy_id": policy_id,
                "procedure_id": procedure_id,
                "covered": False,
                "message": (
                    "This procedure is not covered under "
                    "the selected insurance policy."
                ),
                "coverage_limit": 0,
                "copay_percent": float(policy["copay_percent"]),
                "deductible": float(policy["deductible"]),
                "room_eligibility": policy["room_eligibility"]
            }

        # Get coverage status
        is_covered = str(
            coverage["covered"]
        ).strip().lower() == "yes"

        # Get procedure information
        procedure_data = procedure.iloc[0]

        # Create explanation
        if is_covered:

            message = (
                f"{procedure_data['procedure_name']} is covered "
                f"under the selected insurance policy. "
                f"The applicable coverage limit is "
                f"₹{float(coverage['coverage_limit']):,.0f}. "
                f"The patient may still need to pay the "
                f"deductible and co-pay."
            )

        else:

            message = (
                f"{procedure_data['procedure_name']} is currently "
                f"not covered under the selected insurance policy."
            )

        return {
            "policy_id": policy_id,
            "policy_name": policy["policy_name"],
            "insurer_name": policy["insurer_name"],

            "procedure_id": procedure_id,
            "procedure_name": procedure_data["procedure_name"],
            "specialty": procedure_data["specialty"],

            "covered": is_covered,
            "message": message,

            "coverage_limit": (
                float(coverage["coverage_limit"])
                if is_covered else 0
            ),

            "copay_percent": float(
                policy["copay_percent"]
            ),

            "deductible": float(
                policy["deductible"]
            ),

            "room_eligibility": policy[
                "room_eligibility"
            ]
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            "Coverage Check Error:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Error checking insurance coverage: "
                f"{str(error)}"
            )
        )
    # Estimate patient cost for a selected hospital
# Get available hospitals
@app.get("/hospitals")
def get_hospitals():

    hospital_list = engine.hospitals[
        [
            "hospital_id",
            "hospital_name",
            "city"
        ]
    ].drop_duplicates().to_dict(
        orient="records"
    )

    return {
        "hospitals": hospital_list
    }
@app.get("/estimate-cost")
def estimate_cost(
    policy_id: str,
    procedure_id: str,
    hospital_id: str
):

    try:

        # Validate policy
        policy_exists = policy_id in engine.policies[
            "policy_id"
        ].values

        if not policy_exists:
            raise HTTPException(
                status_code=404,
                detail=f"Policy {policy_id} was not found"
            )

        # Validate procedure
        procedure_exists = procedure_id in engine.procedures[
            "procedure_id"
        ].values

        if not procedure_exists:
            raise HTTPException(
                status_code=404,
                detail=f"Procedure {procedure_id} was not found"
            )

        # Validate hospital
        hospital_exists = hospital_id in engine.hospitals[
            "hospital_id"
        ].values

        if not hospital_exists:
            raise HTTPException(
                status_code=404,
                detail=f"Hospital {hospital_id} was not found"
            )

        # Get policy details
        policy = engine.policies[
            engine.policies["policy_id"] == policy_id
        ].iloc[0]

        # Get procedure details
        procedure = engine.procedures[
            engine.procedures["procedure_id"] == procedure_id
        ].iloc[0]

        # Get hospital details
        hospital = engine.hospitals[
            engine.hospitals["hospital_id"] == hospital_id
        ].iloc[0]

        # Get procedure cost for the selected
        # hospital and procedure
        hospital_procedure = engine.hospital_procedures[
            (
                engine.hospital_procedures["hospital_id"]
                == hospital_id
            )
            &
            (
                engine.hospital_procedures["procedure_id"]
                == procedure_id
            )
        ]

        if hospital_procedure.empty:

            raise HTTPException(
                status_code=404,
                detail=(
                    "The selected procedure is not available "
                    "at this hospital"
                )
            )

        # Get procedure cost
        procedure_cost = float(
            hospital_procedure.iloc[0][
                "estimated_cost"
            ]
        )

        # Get coverage rule
        coverage_rule = engine.coverage_rules[
            (
                engine.coverage_rules["policy_id"]
                == policy_id
            )
            &
            (
                engine.coverage_rules["procedure_id"]
                == procedure_id
            )
        ]

        if coverage_rule.empty:

            raise HTTPException(
                status_code=404,
                detail=(
                    "No coverage information was found for "
                    "this policy and procedure"
                )
            )

        coverage_data = coverage_rule.iloc[0]

        # Check whether procedure is covered
        is_covered = coverage_data["covered"]

        if not is_covered:

            insurance_pays = 0

            estimated_patient_cost = procedure_cost

            return {
                "policy_id": policy_id,
                "policy_name": policy["policy_name"],

                "procedure_id": procedure_id,
                "procedure_name": procedure["procedure_name"],

                "hospital_id": hospital_id,
                "hospital_name": hospital[
                    "hospital_name"
                ],
                "city": hospital["city"],

                "procedure_cost": round(
                    procedure_cost,
                    2
                ),

                "insurance_pays": 0,

                "deductible": 0,

                "copay_percent": 0,

                "copay_amount": 0,

                "estimated_patient_cost": round(
                    estimated_patient_cost,
                    2
                ),

                "covered": False,

                "disclaimer": (
                    "The selected procedure is not covered "
                    "under this insurance policy. "
                    "All costs are illustrative estimates "
                    "based on synthetic prototype data."
                )
            }

        # Coverage limit
        coverage_limit = float(
            coverage_data["coverage_limit"]
        )

        # Insurance amount before co-pay
        insurance_pays = min(
            procedure_cost,
            coverage_limit
        )

        # Deductible
        deductible = float(
            policy.get(
                "deductible",
                0
            )
        )

        # Co-pay percentage
        copay_percent = float(
            policy.get(
                "copay_percent",
                0
            )
        )

        # Calculate co-pay amount
        copay_amount = (
            insurance_pays
            * copay_percent
            / 100
        )

        # Calculate estimated patient cost
        estimated_patient_cost = (
            procedure_cost
            - insurance_pays
            + deductible
            + copay_amount
        )

        # Prevent negative patient cost
        estimated_patient_cost = max(
            0,
            estimated_patient_cost
        )

        return {

            "policy_id": policy_id,
            "policy_name": policy["policy_name"],

            "procedure_id": procedure_id,
            "procedure_name": procedure[
                "procedure_name"
            ],

            "hospital_id": hospital_id,
            "hospital_name": hospital[
                "hospital_name"
            ],
            "city": hospital["city"],

            "procedure_cost": round(
                procedure_cost,
                2
            ),

            "coverage_limit": round(
                coverage_limit,
                2
            ),

            "insurance_pays": round(
                insurance_pays,
                2
            ),

            "deductible": round(
                deductible,
                2
            ),

            "copay_percent": round(
                copay_percent,
                2
            ),

            "copay_amount": round(
                copay_amount,
                2
            ),

            "estimated_patient_cost": round(
                estimated_patient_cost,
                2
            ),

            "covered": True,

            "disclaimer": (
                "All costs are illustrative estimates based "
                "on synthetic prototype data and should not "
                "be considered final medical or insurance quotes."
            )
        }


    except HTTPException:
        raise


    except Exception as error:

        print(
            "Cost Estimation Error:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Error estimating patient cost: "
                f"{str(error)}"
            )
        )