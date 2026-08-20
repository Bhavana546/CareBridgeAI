"use client";

import { useEffect, useState } from "react";
import HospitalRecommendationCard from "./HospitalRecommendationCard";


type Policy = {
  policy_id: string;
  insurer_name: string;
  policy_name: string;
};


type Procedure = {
  procedure_id: string;
  procedure_name: string;
  specialty: string;
};


type Recommendation = {
  hospital_id: string;
  hospital_name: string;
  city: string;
  procedure_cost: number;
  room_eligible: boolean;
  estimated_insurance_amount: number;
  estimated_patient_amount: number;
  recommendation_score: number;
};


type RecommendationSectionProps = {
  extractedPolicyId: string;
};


export default function RecommendationSection({
  extractedPolicyId,
}: RecommendationSectionProps) {

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  const [policyId, setPolicyId] = useState("");
  const [procedureId, setProcedureId] = useState("");

  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");


  // Load policies and procedures
  useEffect(() => {

    const loadInitialData = async () => {

      try {

        setLoadingData(true);

        const [
          policyResponse,
          procedureResponse,
        ] = await Promise.all([
          fetch("http://carebridgeai-fatj.onrender.com/policies"),
          fetch("http://carebridgeai-fatj.onrender.com/procedures"),
        ]);


        const policyData =
          await policyResponse.json();

        const procedureData =
          await procedureResponse.json();


        if (!policyResponse.ok) {

          throw new Error(
            policyData.detail ||
            "Failed to load insurance policies."
          );

        }


        if (!procedureResponse.ok) {

          throw new Error(
            procedureData.detail ||
            "Failed to load medical procedures."
          );

        }


        const loadedPolicies =
          policyData.policies || [];

        const loadedProcedures =
          procedureData.procedures || [];


        setPolicies(loadedPolicies);
        setProcedures(loadedProcedures);


        // Select first policy initially
        if (loadedPolicies.length > 0) {

          setPolicyId(
            loadedPolicies[0].policy_id
          );

        }


        // Select first procedure initially
        if (loadedProcedures.length > 0) {

          setProcedureId(
            loadedProcedures[0].procedure_id
          );

        }


      } catch (error) {

        console.error(
          "Error loading data:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load policies and procedures."
        );


      } finally {

        setLoadingData(false);

      }

    };


    loadInitialData();

  }, []);


  /*
    Check whether the policy extracted from the PDF
    exists in the available policy list.
  */
  const extractedPolicyExists =
    extractedPolicyId !== "" &&
    policies.some(
      (policy) =>
        policy.policy_id === extractedPolicyId
    );


  /*
    Automatically use the extracted policy when valid.

    This is derived directly from props instead of using
    useEffect + setState, so the cascading render warning
    is removed.
  */
  const activePolicyId =
    extractedPolicyExists
      ? extractedPolicyId
      : policyId;


  // Get recommendations
  const getRecommendations = async () => {

    if (!activePolicyId || !procedureId) {

      setError(
        "Please select both an insurance policy and a medical procedure."
      );

      return;

    }


    try {

      setLoading(true);

      setError("");
      setSuccessMessage("");

      setRecommendations([]);


      const response = await fetch(
        `http://carebridgeai-fatj.onrender.com/recommend?policy_id=${encodeURIComponent(
          activePolicyId
        )}&procedure_id=${encodeURIComponent(
          procedureId
        )}`
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to generate hospital recommendations."
        );

      }


      const result =
        data.recommendations || [];


      setRecommendations(result);


      if (result.length === 0) {

        setSuccessMessage(
          "No eligible hospital recommendations were found."
        );

      } else {

        setSuccessMessage(
          `${result.length} hospital recommendation${
            result.length > 1
              ? "s"
              : ""
          } found.`
        );

      }


    } catch (error) {

      console.error(
        "Recommendation request error:",
        error
      );


      setError(
        error instanceof Error
          ? error.message
          : "Unable to generate hospital recommendations."
      );


    } finally {

      setLoading(false);

    }

  };


  // Loading screen
  if (loadingData) {

    return (

      <section className="rounded-2xl bg-white p-8 shadow-md">

        <p className="text-slate-600">
          Loading policies and medical procedures...
        </p>

      </section>

    );

  }


  return (

    <section className="rounded-2xl bg-white p-8 shadow-md">


      {/* Section heading */}
      <h2 className="text-3xl font-bold text-slate-700">
        Find Your Best Care Option
      </h2>


      <p className="mt-2 text-slate-500">
        Compare hospitals based on estimated patient cost
        and insurance room eligibility.
      </p>


      {/* Uploaded policy information */}
      {extractedPolicyExists && (

        <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">

          ✓ Policy automatically selected from uploaded
          document:{" "}

          <strong>
            {extractedPolicyId}
          </strong>

        </div>

      )}


      {/* Policy and procedure selectors */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">


        {/* Insurance Policy */}
        <div>

          <label className="mb-2 block font-medium text-slate-700">
            Insurance Policy
          </label>


          <select
            value={activePolicyId}

            onChange={(e) => {

              setPolicyId(e.target.value);

              setRecommendations([]);
              setError("");
              setSuccessMessage("");

            }}

            className="w-full rounded-lg border border-slate-300 bg-white p-4 text-slate-700 outline-none focus:border-blue-500"
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


        {/* Medical Procedure */}
        <div>

          <label className="mb-2 block font-medium text-slate-700">
            Medical Procedure
          </label>


          <select
            value={procedureId}

            onChange={(e) => {

              setProcedureId(e.target.value);

              setRecommendations([]);
              setError("");
              setSuccessMessage("");

            }}

            className="w-full rounded-lg border border-slate-300 bg-white p-4 text-slate-700 outline-none focus:border-blue-500"
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


      {/* Recommendation button */}
      <button
        onClick={getRecommendations}
        disabled={loading}

        className="mt-6 rounded-xl bg-blue-700 px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
      >

        {loading
          ? "Finding Best Options..."
          : "Get Recommendations"}

      </button>


      {/* Error message */}
      {error && (

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">

          {error}

        </div>

      )}


      {/* Success message */}
      {successMessage && (

        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">

          ✓ {successMessage}

        </div>

      )}


      {/* Recommendations */}
      {recommendations.length > 0 && (

        <div className="mt-10">


          <h3 className="text-3xl font-bold text-slate-700">
            Recommended Hospitals
          </h3>


          <p className="mt-2 text-slate-500">
            Results are ranked using estimated patient
            contribution and room eligibility.
          </p>


          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {recommendations.map(
              (hospital, index) => (

                <HospitalRecommendationCard
                  key={hospital.hospital_id}
                  hospital={hospital}
                  index={index}
                />

              )
            )}

          </div>


          {/* Disclaimer */}
          <div className="mt-8 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">

            <strong>
              Disclaimer:
            </strong>{" "}

            All recommendations and costs are illustrative
            estimates based on synthetic prototype data.

          </div>


        </div>

      )}


    </section>

  );

}