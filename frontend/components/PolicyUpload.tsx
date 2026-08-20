"use client";

import { useState } from "react";

type ExtractedPolicy = {
  policy_id: string | null;
  policy_name: string | null;
  insurer: string | null;
  coverage_limit: number | null;
  deductible: number | null;
  copay_percent: number | null;
  room_eligibility: string | null;
};

type PolicyUploadProps = {
  onPolicyExtracted: (policy: ExtractedPolicy) => void;
};

export default function PolicyUpload({
  onPolicyExtracted,
}: PolicyUploadProps) {
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [uploading, setUploading] = useState(false);

  const [uploadMessage, setUploadMessage] =
    useState("");

  const [uploadError, setUploadError] =
    useState("");

  const [extractedPolicy, setExtractedPolicy] =
    useState<ExtractedPolicy | null>(null);


  const formatCurrency = (
    amount: number | null
  ) => {
    if (amount === null) {
      return "Not available";
    }

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(amount);
  };


  const uploadPolicy = async () => {
    if (!selectedFile) {
      setUploadError(
        "Please select an insurance policy PDF."
      );
      return;
    }

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setUploadError(
        "Please upload a valid PDF file."
      );
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setUploadMessage("");
      setExtractedPolicy(null);

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const response = await fetch(
        "http://127.0.0.1:8000/upload-policy",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to upload insurance policy."
        );
      }

      const policy =
        data.extracted_policy || null;

      setUploadMessage(
        "Insurance policy uploaded and analyzed successfully."
      );

      setExtractedPolicy(policy);

      // Send extracted policy to parent page
      if (policy) {
        onPolicyExtracted(policy);
      }

    } catch (error) {
      console.error(
        "Error uploading policy:",
        error
      );

      setUploadError(
        error instanceof Error
          ? error.message
          : "Unable to upload the insurance policy."
      );

    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="mb-8 rounded-2xl bg-white p-8 shadow-md">

      <h2 className="text-2xl font-semibold text-slate-700">
        Upload Insurance Policy
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Upload your insurance policy PDF to extract
        policy details automatically.
      </p>


      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">

        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            const file =
              e.target.files?.[0] || null;

            setSelectedFile(file);
            setUploadError("");
            setUploadMessage("");
            setExtractedPolicy(null);
          }}
          className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700"
        />


        <button
          onClick={uploadPolicy}
          disabled={
            uploading || !selectedFile
          }
          className="whitespace-nowrap rounded-lg bg-cyan-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-cyan-300"
        >
          {uploading
            ? "Analyzing Policy..."
            : "Upload & Analyze"}
        </button>

      </div>


      {selectedFile && (
        <p className="mt-3 text-sm text-slate-600">
          <strong>Selected file:</strong>{" "}
          {selectedFile.name}
        </p>
      )}


      {uploadMessage && (
        <p className="mt-4 font-medium text-green-600">
          ✓ {uploadMessage}
        </p>
      )}


      {uploadError && (
        <p className="mt-4 font-medium text-red-600">
          {uploadError}
        </p>
      )}


      {extractedPolicy && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-6">

          <h3 className="mb-5 text-xl font-bold text-green-800">
            Extracted Policy Details
          </h3>


          <div className="grid gap-4 md:grid-cols-2">

            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">
                Policy ID
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {extractedPolicy.policy_id ||
                  "Not found"}
              </p>
            </div>


            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">
                Policy Name
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {extractedPolicy.policy_name ||
                  "Not found"}
              </p>
            </div>


            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">
                Insurer
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {extractedPolicy.insurer ||
                  "Not found"}
              </p>
            </div>


            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">
                Coverage Limit
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {formatCurrency(
                  extractedPolicy.coverage_limit
                )}
              </p>
            </div>


            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">
                Deductible
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {formatCurrency(
                  extractedPolicy.deductible
                )}
              </p>
            </div>


            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">
                Co-pay
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {extractedPolicy.copay_percent !== null
                  ? `${extractedPolicy.copay_percent}%`
                  : "Not found"}
              </p>
            </div>


            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">
                Room Eligibility
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {extractedPolicy.room_eligibility ||
                  "Not found"}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}