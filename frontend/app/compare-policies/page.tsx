"use client";

import { useEffect, useState } from "react";

type Policy = {
  policy_id: string;
  insurer_name: string;
  policy_name: string;
  coverage_limit: number;
  deductible: number;
  copay_percent: number;
  room_eligibility: string;
};

type PolicyBasic = {
  policy_id: string;
  insurer_name: string;
  policy_name: string;
};

export default function ComparePoliciesPage() {
  const [policies, setPolicies] = useState<PolicyBasic[]>([]);
  const [firstPolicyId, setFirstPolicyId] = useState("");
  const [secondPolicyId, setSecondPolicyId] = useState("");

  const [firstPolicy, setFirstPolicy] =
    useState<Policy | null>(null);

  const [secondPolicy, setSecondPolicy] =
    useState<Policy | null>(null);

  const [loadingPolicies, setLoadingPolicies] =
    useState(true);

  const [loadingComparison, setLoadingComparison] =
    useState(false);

  const [error, setError] = useState("");


  // Format Indian currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };


  // Load all policies
  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setLoadingPolicies(true);
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/policies"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to load insurance policies."
          );
        }

        const loadedPolicies =
          data.policies || [];

        setPolicies(loadedPolicies);

        if (loadedPolicies.length >= 2) {
          setFirstPolicyId(
            loadedPolicies[0].policy_id
          );

          setSecondPolicyId(
            loadedPolicies[1].policy_id
          );
        }

      } catch (error) {
        console.error(
          "Error loading policies:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load insurance policies."
        );

      } finally {
        setLoadingPolicies(false);
      }
    };

    loadPolicies();
  }, []);


  // Load detailed comparison
  useEffect(() => {
    if (!firstPolicyId || !secondPolicyId) {
      return;
    }

    const loadComparison = async () => {
      try {
        setLoadingComparison(true);
        setError("");

        const response = await fetch(
          `http://127.0.0.1:8000/policy-compare?policy1=${firstPolicyId}&policy2=${secondPolicyId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to compare policies."
          );
        }

        setFirstPolicy(data.policy1);
        setSecondPolicy(data.policy2);

      } catch (error) {
        console.error(
          "Comparison error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to compare policies."
        );

        setFirstPolicy(null);
        setSecondPolicy(null);

      } finally {
        setLoadingComparison(false);
      }
    };

    loadComparison();

  }, [firstPolicyId, secondPolicyId]);


  if (loadingPolicies) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 md:p-10">
        <div className="mx-auto max-w-6xl">

          <div className="rounded-2xl bg-white p-8 shadow-md">
            Loading insurance policies...
          </div>

        </div>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="rounded-2xl bg-linear-to-r from-blue-700 to-cyan-600 p-8 text-white shadow-lg">

          <h1 className="text-3xl font-bold">
            Compare Insurance Policies
          </h1>

          <p className="mt-2 text-blue-100">
            Compare policy benefits, coverage, and
            estimated financial responsibility.
          </p>

        </div>


        {/* Policy Selection */}
        <div className="mt-8 rounded-2xl bg-white p-8 shadow-md">

          <h2 className="text-2xl font-bold text-slate-700">
            Select Policies to Compare
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            {/* First Policy */}
            <div>

              <label className="mb-2 block font-medium text-slate-700">
                First Policy
              </label>

              <select
                value={firstPolicyId}
                onChange={(e) =>
                  setFirstPolicyId(e.target.value)
                }
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


            {/* Second Policy */}
            <div>

              <label className="mb-2 block font-medium text-slate-700">
                Second Policy
              </label>

              <select
                value={secondPolicyId}
                onChange={(e) =>
                  setSecondPolicyId(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white p-4 text-slate-700 outline-none focus:border-cyan-500"
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

          </div>

        </div>


        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}


        {/* Loading */}
        {loadingComparison && (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center text-slate-600 shadow-md">
            Comparing insurance policies...
          </div>
        )}


        {/* Comparison Results */}
        {!loadingComparison &&
          firstPolicy &&
          secondPolicy && (

          <div className="mt-8">

            <div className="mb-6">

              <h2 className="text-3xl font-bold text-slate-700">
                Policy Comparison
              </h2>

              <p className="mt-2 text-slate-500">
                Compare the important coverage and
                financial features of both policies.
              </p>

            </div>


            {/* Desktop Comparison Table */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-md">

              <div className="overflow-x-auto">

                <table className="w-full border-collapse">

                  <thead>

                    <tr className="bg-slate-50">

                      <th className="border-b border-slate-200 p-5 text-left text-slate-600">
                        Feature
                      </th>

                      <th className="border-b border-slate-200 p-5 text-left">

                        <p className="text-lg font-bold text-blue-700">
                          {firstPolicy.policy_name}
                        </p>

                        <p className="mt-1 text-sm font-normal text-slate-500">
                          {firstPolicy.insurer_name}
                        </p>

                      </th>

                      <th className="border-b border-slate-200 p-5 text-left">

                        <p className="text-lg font-bold text-cyan-700">
                          {secondPolicy.policy_name}
                        </p>

                        <p className="mt-1 text-sm font-normal text-slate-500">
                          {secondPolicy.insurer_name}
                        </p>

                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {/* Policy ID */}
                    <tr>

                      <td className="border-b border-slate-100 p-5 font-semibold text-slate-700">
                        Policy ID
                      </td>

                      <td className="border-b border-slate-100 p-5 text-slate-600">
                        {firstPolicy.policy_id}
                      </td>

                      <td className="border-b border-slate-100 p-5 text-slate-600">
                        {secondPolicy.policy_id}
                      </td>

                    </tr>


                    {/* Coverage Limit */}
                    <tr className="bg-slate-50/50">

                      <td className="border-b border-slate-100 p-5 font-semibold text-slate-700">
                        Coverage Limit
                      </td>

                      <td className="border-b border-slate-100 p-5 text-slate-700">

                        {formatCurrency(
                          firstPolicy.coverage_limit
                        )}

                        {firstPolicy.coverage_limit >
                          secondPolicy.coverage_limit && (
                          <span className="ml-3 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Higher Coverage
                          </span>
                        )}

                      </td>

                      <td className="border-b border-slate-100 p-5 text-slate-700">

                        {formatCurrency(
                          secondPolicy.coverage_limit
                        )}

                        {secondPolicy.coverage_limit >
                          firstPolicy.coverage_limit && (
                          <span className="ml-3 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Higher Coverage
                          </span>
                        )}

                      </td>

                    </tr>


                    {/* Deductible */}
                    <tr>

                      <td className="border-b border-slate-100 p-5 font-semibold text-slate-700">
                        Deductible
                      </td>

                      <td className="border-b border-slate-100 p-5 text-slate-700">

                        {formatCurrency(
                          firstPolicy.deductible
                        )}

                        {firstPolicy.deductible <
                          secondPolicy.deductible && (
                          <span className="ml-3 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Lower Deductible
                          </span>
                        )}

                      </td>

                      <td className="border-b border-slate-100 p-5 text-slate-700">

                        {formatCurrency(
                          secondPolicy.deductible
                        )}

                        {secondPolicy.deductible <
                          firstPolicy.deductible && (
                          <span className="ml-3 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Lower Deductible
                          </span>
                        )}

                      </td>

                    </tr>


                    {/* Co-pay */}
                    <tr className="bg-slate-50/50">

                      <td className="border-b border-slate-100 p-5 font-semibold text-slate-700">
                        Co-pay Percentage
                      </td>

                      <td className="border-b border-slate-100 p-5 text-slate-700">

                        {firstPolicy.copay_percent}%

                        {firstPolicy.copay_percent <
                          secondPolicy.copay_percent && (
                          <span className="ml-3 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Lower Co-pay
                          </span>
                        )}

                      </td>

                      <td className="border-b border-slate-100 p-5 text-slate-700">

                        {secondPolicy.copay_percent}%

                        {secondPolicy.copay_percent <
                          firstPolicy.copay_percent && (
                          <span className="ml-3 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Lower Co-pay
                          </span>
                        )}

                      </td>

                    </tr>


                    {/* Room Eligibility */}
                    <tr>

                      <td className="p-5 font-semibold text-slate-700">
                        Room Eligibility
                      </td>

                      <td className="p-5 text-slate-700">
                        {firstPolicy.room_eligibility}
                      </td>

                      <td className="p-5 text-slate-700">
                        {secondPolicy.room_eligibility}
                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>


            {/* Quick Analysis */}
            <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">

              <h3 className="text-xl font-bold text-blue-800">
                Quick Comparison Insight
              </h3>

              <div className="mt-4 space-y-2 text-blue-700">

                {firstPolicy.coverage_limit >
                  secondPolicy.coverage_limit && (
                  <p>
                    ✓ <strong>
                      {firstPolicy.policy_name}
                    </strong>{" "}
                    offers a higher coverage limit.
                  </p>
                )}

                {secondPolicy.coverage_limit >
                  firstPolicy.coverage_limit && (
                  <p>
                    ✓ <strong>
                      {secondPolicy.policy_name}
                    </strong>{" "}
                    offers a higher coverage limit.
                  </p>
                )}

                {firstPolicy.deductible <
                  secondPolicy.deductible && (
                  <p>
                    ✓ <strong>
                      {firstPolicy.policy_name}
                    </strong>{" "}
                    has a lower deductible.
                  </p>
                )}

                {secondPolicy.deductible <
                  firstPolicy.deductible && (
                  <p>
                    ✓ <strong>
                      {secondPolicy.policy_name}
                    </strong>{" "}
                    has a lower deductible.
                  </p>
                )}

                {firstPolicy.copay_percent <
                  secondPolicy.copay_percent && (
                  <p>
                    ✓ <strong>
                      {firstPolicy.policy_name}
                    </strong>{" "}
                    has a lower co-pay percentage.
                  </p>
                )}

                {secondPolicy.copay_percent <
                  firstPolicy.copay_percent && (
                  <p>
                    ✓ <strong>
                      {secondPolicy.policy_name}
                    </strong>{" "}
                    has a lower co-pay percentage.
                  </p>
                )}

              </div>

            </div>


            {/* Disclaimer */}
            <div className="mt-6 rounded-xl bg-slate-200/70 p-4 text-sm text-slate-600">

              <strong>Disclaimer:</strong> Policy comparisons
              are based on the available synthetic prototype
              data and are intended for demonstration purposes.

            </div>

          </div>
        )}

      </div>
    </main>
  );
}