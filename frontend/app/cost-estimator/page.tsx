"use client";

import { useEffect, useState } from "react";

interface Policy {
  policy_id: string;
  insurer_name: string;
  policy_name: string;
}

interface Procedure {
  procedure_id: string;
  procedure_name: string;
  specialty: string;
}

interface Hospital {
  hospital_id: string;
  hospital_name: string;
  city: string;
}

interface CostResult {
  policy_id: string;
  policy_name: string;

  procedure_id: string;
  procedure_name: string;

  hospital_id: string;
  hospital_name: string;
  city: string;

  procedure_cost: number;
  insurance_pays: number;
  deductible: number;
  copay_percent: number;
  copay_amount: number;
  estimated_patient_cost: number;

  disclaimer: string;
}

const API_URL = "http://127.0.0.1:8000";

const formatCurrency = (value: number | undefined | null) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Not Available";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

export default function CostEstimatorPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const [policyId, setPolicyId] = useState("");
  const [procedureId, setProcedureId] = useState("");
  const [hospitalId, setHospitalId] = useState("");

  const [result, setResult] = useState<CostResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);

        const [
          policiesResponse,
          proceduresResponse,
          hospitalsResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/policies`),
          fetch(`${API_URL}/procedures`),
          fetch(`${API_URL}/hospitals`),
        ]);

        if (!policiesResponse.ok) {
          throw new Error("Failed to load insurance policies");
        }

        if (!proceduresResponse.ok) {
          throw new Error("Failed to load medical procedures");
        }

        if (!hospitalsResponse.ok) {
          throw new Error("Failed to load hospitals");
        }

        const policiesData = await policiesResponse.json();
        const proceduresData = await proceduresResponse.json();
        const hospitalsData = await hospitalsResponse.json();

        const loadedPolicies = policiesData.policies || [];
        const loadedProcedures =
          proceduresData.procedures || [];
        const loadedHospitals =
          hospitalsData.hospitals || [];

        setPolicies(loadedPolicies);
        setProcedures(loadedProcedures);
        setHospitals(loadedHospitals);

        if (loadedPolicies.length > 0) {
          setPolicyId(loadedPolicies[0].policy_id);
        }

        if (loadedProcedures.length > 0) {
          setProcedureId(
            loadedProcedures[0].procedure_id
          );
        }

        if (loadedHospitals.length > 0) {
          setHospitalId(
            loadedHospitals[0].hospital_id
          );
        }
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load data. Please make sure the backend is running."
        );
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  const estimateCost = async () => {
    if (!policyId || !procedureId || !hospitalId) {
      setError(
        "Please select an insurance policy, medical procedure, and hospital."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch(
        `${API_URL}/estimate-cost?policy_id=${encodeURIComponent(
          policyId
        )}&procedure_id=${encodeURIComponent(
          procedureId
        )}&hospital_id=${encodeURIComponent(
          hospitalId
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to estimate patient cost"
        );
      }

      setResult(data);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Something went wrong while estimating the cost."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <main className="cost-page">
        <div className="cost-container">
          <section className="cost-header">
            <div className="cost-header-content">
              <span className="cost-eyebrow">
                CAREBRIDGE AI
              </span>

              <h1>Patient Cost Estimator</h1>

              <p>
                Estimate your expected out-of-pocket
                medical expenses before choosing a hospital.
              </p>
            </div>
          </section>

          <section className="cost-panel loading-panel">
            <div className="loading-spinner" />
            <p>
              Loading policies, procedures and hospitals...
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="cost-page">
      <div className="cost-container">

        {/* Header */}
        <section className="cost-header">
          <div className="cost-header-content">
            <span className="cost-eyebrow">
              CAREBRIDGE AI
            </span>

            <h1>Patient Cost Estimator</h1>

            <p>
              Estimate your expected out-of-pocket
              medical expenses before choosing a hospital.
            </p>
          </div>

          <div className="cost-header-icon">
            ₹
          </div>
        </section>

        {/* Selection Panel */}
        <section className="cost-panel">
          <div className="section-title">
            <div>
              <span className="section-eyebrow">
                COST PLANNING
              </span>

              <h2>Estimate Your Medical Cost</h2>

              <p>
                Select your insurance policy, medical
                procedure and preferred hospital.
              </p>
            </div>
          </div>

          <div className="cost-select-grid">

            <div className="cost-field">
              <label htmlFor="policy">
                Insurance Policy
              </label>

              <select
                id="policy"
                value={policyId}
                onChange={(event) => {
                  setPolicyId(event.target.value);
                  setResult(null);
                  setError("");
                }}
              >
                {policies.map((policy) => (
                  <option
                    key={policy.policy_id}
                    value={policy.policy_id}
                  >
                    {policy.policy_id} -{" "}
                    {policy.insurer_name} -{" "}
                    {policy.policy_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="cost-field">
              <label htmlFor="procedure">
                Medical Procedure
              </label>

              <select
                id="procedure"
                value={procedureId}
                onChange={(event) => {
                  setProcedureId(event.target.value);
                  setResult(null);
                  setError("");
                }}
              >
                {procedures.map((procedure) => (
                  <option
                    key={procedure.procedure_id}
                    value={procedure.procedure_id}
                  >
                    {procedure.procedure_id} -{" "}
                    {procedure.procedure_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="cost-field">
              <label htmlFor="hospital">
                Hospital
              </label>

              <select
                id="hospital"
                value={hospitalId}
                onChange={(event) => {
                  setHospitalId(event.target.value);
                  setResult(null);
                  setError("");
                }}
              >
                {hospitals.map((hospital) => (
                  <option
                    key={hospital.hospital_id}
                    value={hospital.hospital_id}
                  >
                    {hospital.hospital_name} -{" "}
                    {hospital.city}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <button
            className="cost-button"
            onClick={estimateCost}
            disabled={loading}
          >
            {loading ? (
              "Calculating..."
            ) : (
              <>
                Estimate My Cost
                <span>→</span>
              </>
            )}
          </button>
        </section>

        {/* Error */}
        {error && (
          <div className="cost-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <section className="cost-result">

            <div className="cost-result-top">

              <div>
                <span className="section-eyebrow">
                  COST ESTIMATION RESULT
                </span>

                <h2>
                  Your Estimated Medical Expense
                </h2>

                <p>
                  Estimated based on your selected policy,
                  procedure and hospital.
                </p>
              </div>

              <div className="estimated-cost-card">
                <span>
                  ESTIMATED PATIENT COST
                </span>

                <strong>
                  {formatCurrency(
                    result.estimated_patient_cost
                  )}
                </strong>
              </div>

            </div>

            {/* Selected Details */}
            <div className="cost-selection-info">

              <div className="selection-card">
                <span>Insurance Policy</span>
                <strong>{result.policy_name}</strong>
              </div>

              <div className="selection-card">
                <span>Medical Procedure</span>
                <strong>
                  {result.procedure_name}
                </strong>
              </div>

              <div className="selection-card">
                <span>Selected Hospital</span>
                <strong>
                  {result.hospital_name}
                </strong>
                <small>{result.city}</small>
              </div>

            </div>

            <div className="breakdown-title">
              <h3>Cost Breakdown</h3>
              <span>
                Estimated financial responsibility
              </span>
            </div>

            <div className="cost-breakdown">

              <div className="cost-row">
                <span>
                  <span className="row-icon">
                    ₹
                  </span>
                  Procedure Cost
                </span>

                <strong>
                  {formatCurrency(
                    result.procedure_cost
                  )}
                </strong>
              </div>

              <div className="cost-row insurance-row">
                <span>
                  <span className="row-icon">
                    ↓
                  </span>
                  Insurance Contribution
                </span>

                <strong>
                  -{" "}
                  {formatCurrency(
                    result.insurance_pays
                  )}
                </strong>
              </div>

              <div className="cost-row">
                <span>
                  <span className="row-icon">
                    +
                  </span>
                  Deductible
                </span>

                <strong>
                  +{" "}
                  {formatCurrency(
                    result.deductible
                  )}
                </strong>
              </div>

              <div className="cost-row">
                <span>
                  <span className="row-icon">
                    %
                  </span>
                  Co-pay ({result.copay_percent}%)
                </span>

                <strong>
                  +{" "}
                  {formatCurrency(
                    result.copay_amount
                  )}
                </strong>
              </div>

              <div className="cost-total">
                <div>
                  <span>
                    Your Estimated Cost
                  </span>

                  <small>
                    Approximate out-of-pocket expense
                  </small>
                </div>

                <strong>
                  {formatCurrency(
                    result.estimated_patient_cost
                  )}
                </strong>
              </div>

            </div>

          </section>
        )}

        {/* Disclaimer */}
        <div className="cost-disclaimer">
          <strong>Disclaimer:</strong>
          <span>
            Patient cost calculations are illustrative
            estimates based on synthetic prototype data
            and should not be considered final medical
            or insurance quotes.
          </span>
        </div>

      </div>
    </main>
  );
}