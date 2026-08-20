"use client";

import "./page.css";
import { useEffect, useState } from "react";

type Policy = {
  policy_id: string;
  insurer_name: string;
  policy_name: string;
};

type Hospital = {
  hospital_id: string;
  hospital_name: string;
  city: string;
};

type Procedure = {
  procedure_id: string;
  procedure_name: string;
  specialty: string;
};

type ClaimResult = {
  status: "Ready" | "Attention Needed";
  issues: string[];
};

export default function ClaimAssistantPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  const [policyId, setPolicyId] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [procedureId, setProcedureId] = useState("");

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ClaimResult | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          policyResponse,
          hospitalResponse,
          procedureResponse,
        ] = await Promise.all([
          fetch("http://127.0.0.1:8000/policies"),
          fetch("http://127.0.0.1:8000/hospitals"),
          fetch("http://127.0.0.1:8000/procedures"),
        ]);

        if (
          !policyResponse.ok ||
          !hospitalResponse.ok ||
          !procedureResponse.ok
        ) {
          throw new Error(
            "Unable to load claim preparation data."
          );
        }

        const policyData =
          await policyResponse.json();

        const hospitalData =
          await hospitalResponse.json();

        const procedureData =
          await procedureResponse.json();

        setPolicies(policyData.policies || []);
        setHospitals(hospitalData.hospitals || []);
        setProcedures(procedureData.procedures || []);

      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);


  const checkClaimReadiness = () => {
    setError("");
    setResult(null);

    if (!policyId || !hospitalId || !procedureId) {
      setError(
        "Please select a policy, hospital, and medical procedure."
      );
      return;
    }

    setChecking(true);

    setTimeout(() => {
      const issues: string[] = [];

      if (!policyId) {
        issues.push(
          "Insurance policy information is missing."
        );
      }

      if (!hospitalId) {
        issues.push(
          "Hospital information is missing."
        );
      }

      if (!procedureId) {
        issues.push(
          "Medical procedure information is missing."
        );
      }

      setResult({
        status:
          issues.length === 0
            ? "Ready"
            : "Attention Needed",
        issues,
      });

      setChecking(false);
    }, 500);
  };


  const selectedPolicy = policies.find(
    (policy) =>
      policy.policy_id === policyId
  );

  const selectedHospital = hospitals.find(
    (hospital) =>
      hospital.hospital_id === hospitalId
  );

  const selectedProcedure = procedures.find(
    (procedure) =>
      procedure.procedure_id === procedureId
  );


  return (
    <main className="claim-page">
      <div className="claim-container">

        {/* Hero */}
        <section className="claim-hero">
          <div>
            <p className="claim-eyebrow">
              CAREBRIDGE AI
            </p>

            <h1>Insurance Claim Assistant</h1>

            <p>
              Prepare your insurance claim and check whether
              you have the important information needed before
              starting the claim process.
            </p>
          </div>

          <div className="claim-hero-icon">
            📋
          </div>
        </section>


        {/* Main Card */}
        <section className="claim-form-card">

          <p className="claim-section-label">
            CLAIM PREPARATION
          </p>

          <h2>Check Your Claim Readiness</h2>

          <p className="claim-description">
            Select your policy, hospital, and treatment
            procedure to generate a claim preparation summary.
          </p>


          {loading ? (
            <div className="claim-loading">
              Loading claim information...
            </div>
          ) : (
            <div className="claim-form">

              <div className="claim-field">
                <label>
                  Insurance Policy
                </label>

                <select
                  value={policyId}
                  onChange={(event) => {
                    setPolicyId(event.target.value);
                    setResult(null);
                  }}
                >
                  <option value="">
                    Select Insurance Policy
                  </option>

                  {policies.map((policy) => (
                    <option
                      key={policy.policy_id}
                      value={policy.policy_id}
                    >
                      {policy.policy_id} -{" "}
                      {policy.policy_name}
                    </option>
                  ))}
                </select>
              </div>


              <div className="claim-field">
                <label>
                  Hospital
                </label>

                <select
                  value={hospitalId}
                  onChange={(event) => {
                    setHospitalId(event.target.value);
                    setResult(null);
                  }}
                >
                  <option value="">
                    Select Hospital
                  </option>

                  {hospitals.map((hospital) => (
                    <option
                      key={hospital.hospital_id}
                      value={hospital.hospital_id}
                    >
                      {hospital.hospital_name}
                      {" - "}
                      {hospital.city}
                    </option>
                  ))}
                </select>
              </div>


              <div className="claim-field">
                <label>
                  Medical Procedure
                </label>

                <select
                  value={procedureId}
                  onChange={(event) => {
                    setProcedureId(event.target.value);
                    setResult(null);
                  }}
                >
                  <option value="">
                    Select Medical Procedure
                  </option>

                  {procedures.map((procedure) => (
                    <option
                      key={procedure.procedure_id}
                      value={procedure.procedure_id}
                    >
                      {procedure.procedure_name}
                      {" - "}
                      {procedure.specialty}
                    </option>
                  ))}
                </select>
              </div>


              <button
                className="claim-check-button"
                onClick={checkClaimReadiness}
                disabled={checking}
              >
                {checking
                  ? "Checking Claim..."
                  : "Check Claim Readiness"}
              </button>

            </div>
          )}
        </section>


        {/* Error */}
        {error && (
          <div className="claim-error">
            <span>!</span>
            {error}
          </div>
        )}


        {/* Result */}
        {result && (
          <section className="claim-result-section">

            <div className="claim-result-header">
              <div>
                <p className="claim-section-label">
                  CLAIM SUMMARY
                </p>

                <h2>Your Claim Readiness</h2>
              </div>

              <div
                className={
                  result.status === "Ready"
                    ? "claim-status-ready"
                    : "claim-status-warning"
                }
              >
                {result.status === "Ready"
                  ? "✓ Ready"
                  : "⚠ Attention Needed"}
              </div>
            </div>


            {/* Selected Details */}
            <div className="claim-summary-grid">

              <div className="claim-summary-card">
                <span>Insurance Policy</span>
                <strong>
                  {selectedPolicy?.policy_name ||
                    "Not selected"}
                </strong>
                <small>
                  {selectedPolicy?.insurer_name || ""}
                </small>
              </div>


              <div className="claim-summary-card">
                <span>Hospital</span>
                <strong>
                  {selectedHospital?.hospital_name ||
                    "Not selected"}
                </strong>
                <small>
                  {selectedHospital?.city || ""}
                </small>
              </div>


              <div className="claim-summary-card">
                <span>Medical Procedure</span>
                <strong>
                  {selectedProcedure?.procedure_name ||
                    "Not selected"}
                </strong>
                <small>
                  {selectedProcedure?.specialty || ""}
                </small>
              </div>

            </div>


            {/* Documents Checklist */}
            <div className="claim-checklist-card">

              <h3>
                Recommended Claim Documents
              </h3>

              <div className="claim-checklist">

                <div className="claim-check-item">
                  <span>✓</span>
                  Insurance policy details
                </div>

                <div className="claim-check-item">
                  <span>✓</span>
                  Government-issued identification
                </div>

                <div className="claim-check-item">
                  <span>✓</span>
                  Hospital admission or treatment records
                </div>

                <div className="claim-check-item">
                  <span>✓</span>
                  Doctor&apos;s prescription or medical documents
                </div>

                <div className="claim-check-item">
                  <span>✓</span>
                  Original hospital bills and receipts
                </div>

              </div>
            </div>


            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="claim-issues">
                <h3>Items Requiring Attention</h3>

                {result.issues.map((issue, index) => (
                  <p key={index}>
                    ⚠ {issue}
                  </p>
                ))}
              </div>
            )}


            {result.status === "Ready" && (
              <div className="claim-success-message">
                <strong>
                  Your basic claim information is ready.
                </strong>

                <p>
                  Before submitting a real claim, verify the
                  exact requirements with your insurance
                  provider.
                </p>
              </div>
            )}

          </section>
        )}


        {/* Information */}
        <section className="claim-info-card">
          <div className="claim-info-icon">
            ℹ
          </div>

          <div>
            <h3>Important Information</h3>

            <p>
              This claim assistant helps you organize basic
              information before starting an insurance claim.
              Actual claim approval depends on policy terms,
              coverage rules, documentation, and insurer
              verification.
            </p>
          </div>
        </section>


        <div className="claim-disclaimer">
          <strong>Disclaimer:</strong>{" "}
          This feature provides a prototype claim preparation
          checklist using synthetic demonstration data. It does
          not submit or approve insurance claims.
        </div>

      </div>
    </main>
  );
}