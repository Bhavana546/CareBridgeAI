"use client";

import { useState } from "react";
import PolicyUpload from "../components/PolicyUpload";
import RecommendationSection from "../components/RecommendationSection";

export default function Home() {
  const [extractedPolicyId, setExtractedPolicyId] =
    useState("");

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 rounded-2xl bg-linear-to-r from-blue-700 to-cyan-600 p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold">
            CareBridge AI
          </h1>

          <p className="mt-2 text-lg text-blue-100">
            Intelligent Hospital and Insurance Recommendation Platform
          </p>
        </div>

        {/* Insurance Policy Upload */}
        <PolicyUpload
          onPolicyExtracted={(policy) =>
            setExtractedPolicyId(policy.policy_id || "")
          }
        />

        {/* Hospital Recommendations */}
        <RecommendationSection
          extractedPolicyId={extractedPolicyId}
        />

      </div>
    </main>
  );
}