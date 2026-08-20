"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function HospitalNetworkPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [policyResponse, hospitalResponse] = await Promise.all([
          fetch("https://carebridgeai-fatj.onrender.com/policies"),
          fetch("https://carebridgeai-fatj.onrender.com/hospitals"),
        ]);

        if (!policyResponse.ok) {
          throw new Error("Unable to load insurance policies");
        }

        if (!hospitalResponse.ok) {
          throw new Error("Unable to load hospitals");
        }

        const policyData = await policyResponse.json();
        const hospitalData = await hospitalResponse.json();

        setPolicies(policyData.policies || []);
        setHospitals(hospitalData.hospitals || []);

        if (policyData.policies?.length > 0) {
          setSelectedPolicy(policyData.policies[0].policy_id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the hospital network"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const cities = useMemo(() => {
    const uniqueCities = [
      ...new Set(
        hospitals
          .map((hospital) => hospital.city)
          .filter(Boolean)
      ),
    ];

    return uniqueCities.sort();
  }, [hospitals]);

  const filteredHospitals = useMemo(() => {
    if (selectedCity === "All Cities") {
      return hospitals;
    }

    return hospitals.filter(
      (hospital) => hospital.city === selectedCity
    );
  }, [hospitals, selectedCity]);

  const selectedPolicyData = policies.find(
    (policy) => policy.policy_id === selectedPolicy
  );

  return (
    <main className="network-page">
      <div className="network-container">

        {/* Header */}
        <section className="network-hero">
          <div>
            <p className="network-eyebrow">CAREBRIDGE AI</p>

            <h1>Hospital Network Explorer</h1>

            <p>
              Explore hospitals available in your insurance network
              and find care options by location.
            </p>
          </div>

          <div className="network-icon">
            🏥
          </div>
        </section>

        {/* Filter Section */}
        <section className="network-filter-card">
          <div className="section-label">
            NETWORK SEARCH
          </div>

          <h2>Explore Your Hospital Network</h2>

          <p className="section-description">
            Select your insurance policy and filter hospitals by city.
          </p>

          <div className="network-controls">

            <div className="network-field">
              <label>Insurance Policy</label>

              <select
                value={selectedPolicy}
                onChange={(event) =>
                  setSelectedPolicy(event.target.value)
                }
              >
                {policies.map((policy) => (
                  <option
                    key={policy.policy_id}
                    value={policy.policy_id}
                  >
                    {policy.policy_id} - {policy.policy_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="network-field">
              <label>Filter by City</label>

              <select
                value={selectedCity}
                onChange={(event) =>
                  setSelectedCity(event.target.value)
                }
              >
                <option value="All Cities">
                  All Cities
                </option>

                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedPolicyData && (
            <div className="selected-policy-banner">
              <span className="policy-check">✓</span>

              <div>
                <strong>
                  Exploring network for{" "}
                  {selectedPolicyData.policy_name}
                </strong>

                <p>
                  {selectedPolicyData.insurer_name}
                  {" • "}
                  Policy ID: {selectedPolicyData.policy_id}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="network-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="network-loading">
            Loading hospital network...
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            <section className="network-results-header">
              <div>
                <p className="section-label">
                  AVAILABLE NETWORK
                </p>

                <h2>Hospitals You Can Explore</h2>

                <p>
                  Browse available hospitals based on your selected
                  location.
                </p>
              </div>

              <div className="hospital-count">
                <strong>{filteredHospitals.length}</strong>
                <span>
                  Hospital
                  {filteredHospitals.length !== 1 ? "s" : ""}
                </span>
              </div>
            </section>

            {filteredHospitals.length === 0 ? (
              <div className="no-hospitals">
                <div className="empty-icon">🏥</div>

                <h3>No Hospitals Found</h3>

                <p>
                  No hospitals are currently available for this city.
                  Try selecting another location.
                </p>
              </div>
            ) : (
              <section className="hospital-grid">
                {filteredHospitals.map((hospital) => (
                  <article
                    className="hospital-card"
                    key={hospital.hospital_id}
                  >
                    <div className="hospital-card-top">
                      <div className="hospital-avatar">
                        🏥
                      </div>

                      <span className="network-badge">
                        In Network
                      </span>
                    </div>

                    <h3>
                      {hospital.hospital_name}
                    </h3>

                    <div className="hospital-location">
                      <span>⌖</span>
                      {hospital.city}
                    </div>

                    <div className="hospital-divider" />

                    <div className="hospital-info-row">
                      <span>Hospital ID</span>

                      <strong>
                        {hospital.hospital_id}
                      </strong>
                    </div>

                    <div className="hospital-info-row">
                      <span>Network Status</span>

                      <strong className="active-status">
                        ✓ Available
                      </strong>
                    </div>

                    <button className="hospital-button">
                      View Hospital Details →
                    </button>
                  </article>
                ))}
              </section>
            )}

            {/* Info Card */}
            <section className="network-info-card">
              <div className="info-icon">ℹ</div>

              <div>
                <h3>About Hospital Networks</h3>

                <p>
                  Hospital network availability shown here is based on
                  the synthetic prototype dataset. Actual insurance
                  network eligibility may depend on your policy terms,
                  location and hospital agreements.
                </p>
              </div>
            </section>
          </>
        )}

        {/* Disclaimer */}
        <div className="network-disclaimer">
          <strong>Disclaimer:</strong>{" "}
          Hospital network information is provided for demonstration
          purposes using synthetic prototype data.
        </div>

      </div>
    </main>
  );
}
