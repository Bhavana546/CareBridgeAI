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

interface CoverageResult {
  policy_id: string;
  policy_name: string;
  insurer_name: string;

  procedure_id: string;
  procedure_name: string;
  specialty: string;

  covered: boolean;
  message: string;

  coverage_limit: number;
  copay_percent: number;
  deductible: number;
  room_eligibility: string;
}

const API_URL = "https://carebridgeai-fatj.onrender.com";

const formatCurrency = (value: number | undefined | null) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Not Available";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

export default function CoverageCheckerPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  const [policyId, setPolicyId] = useState("");
  const [procedureId, setProcedureId] = useState("");

  const [result, setResult] = useState<CoverageResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);

        const [policiesResponse, proceduresResponse] =
          await Promise.all([
            fetch(`${API_URL}/policies`),
            fetch(`${API_URL}/procedures`),
          ]);

        if (!policiesResponse.ok) {
          throw new Error("Failed to load insurance policies");
        }

        if (!proceduresResponse.ok) {
          throw new Error("Failed to load medical procedures");
        }

        const policiesData = await policiesResponse.json();
        const proceduresData = await proceduresResponse.json();

        setPolicies(policiesData.policies || []);
        setProcedures(proceduresData.procedures || []);

        if (policiesData.policies?.length > 0) {
          setPolicyId(policiesData.policies[0].policy_id);
        }

        if (proceduresData.procedures?.length > 0) {
          setProcedureId(
            proceduresData.procedures[0].procedure_id
          );
        }
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load policies and procedures. " +
            "Please make sure the backend is running."
        );
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  const checkCoverage = async () => {
    if (!policyId || !procedureId) {
      setError(
        "Please select both an insurance policy and a medical procedure."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch(
        `${API_URL}/check-coverage?policy_id=${encodeURIComponent(
          policyId
        )}&procedure_id=${encodeURIComponent(procedureId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to check insurance coverage"
        );
      }

      setResult(data);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong while checking coverage.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <main className="coverage-page">
        <div className="coverage-container">
          <div className="coverage-header">
            <h1>Coverage Checker</h1>
            <p>
              Check whether your medical procedure is covered
              by your insurance policy.
            </p>
          </div>

          <div className="coverage-panel">
            <p>Loading policies and procedures...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="coverage-page">
      <div className="coverage-container">

        {/* Header */}
        <section className="coverage-header">
          <h1>Coverage Checker</h1>

          <p>
            Check whether a medical procedure is covered
            under your selected insurance policy.
          </p>
        </section>

        {/* Selection Panel */}
        <section className="coverage-panel">
          <h2>Check Your Coverage</h2>

          <div className="coverage-select-grid">

            <div className="coverage-field">
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
                    {policy.policy_id} - {policy.insurer_name} -{" "}
                    {policy.policy_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="coverage-field">
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
                    {procedure.procedure_name} (
                    {procedure.specialty})
                  </option>
                ))}
              </select>
            </div>

          </div>

          <button
            className="coverage-button"
            onClick={checkCoverage}
            disabled={loading}
          >
            {loading
              ? "Checking Coverage..."
              : "Check Coverage"}
          </button>
        </section>

        {/* Error */}
        {error && (
          <div className="coverage-error">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <section
            className={
              result.covered
                ? "coverage-result covered"
                : "coverage-result not-covered"
            }
          >

            <div className="coverage-result-top">
              <div>
                <span className="coverage-label">
                  COVERAGE RESULT
                </span>

                <h2>
                  {result.covered
                    ? "✓ Procedure Covered"
                    : "✕ Procedure Not Covered"}
                </h2>
              </div>

              <div
                className={
                  result.covered
                    ? "coverage-status covered-status"
                    : "coverage-status not-covered-status"
                }
              >
                {result.covered
                  ? "COVERED"
                  : "NOT COVERED"}
              </div>
            </div>

            <p className="coverage-message">
              {result.message}
            </p>

            <div className="coverage-info-grid">

              <div className="coverage-info-card">
                <span>Insurance Policy</span>

                <strong>
                  {result.policy_name}
                </strong>

                <small>
                  {result.insurer_name}
                </small>
              </div>

              <div className="coverage-info-card">
                <span>Medical Procedure</span>

                <strong>
                  {result.procedure_name}
                </strong>

                <small>
                  {result.specialty}
                </small>
              </div>

              <div className="coverage-info-card">
                <span>Coverage Limit</span>

                <strong>
                  {formatCurrency(
                    result.coverage_limit
                  )}
                </strong>
              </div>

              <div className="coverage-info-card">
                <span>Co-pay Percentage</span>

                <strong>
                  {result.copay_percent}%
                </strong>
              </div>

              <div className="coverage-info-card">
                <span>Deductible</span>

                <strong>
                  {formatCurrency(
                    result.deductible
                  )}
                </strong>
              </div>

              <div className="coverage-info-card">
                <span>Room Eligibility</span>

                <strong>
                  {result.room_eligibility}
                </strong>
              </div>

            </div>

          </section>
        )}

        {/* Disclaimer */}
        <div className="coverage-disclaimer">
          <strong>Disclaimer:</strong> Coverage information is
          based on the available synthetic prototype data and is
          intended for demonstration purposes.
        </div>

      </div>
    </main>
  );
}