"use client";
import "./page.css";

import { useEffect, useMemo, useState } from "react";

type Procedure = {
  procedure_id: string;
  procedure_name: string;
  specialty: string;
};

export default function ProcedureExplorerPage() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] =
    useState("All Specialties");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProcedures = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/procedures"
        );

        if (!response.ok) {
          throw new Error("Unable to load medical procedures");
        }

        const data = await response.json();

        setProcedures(data.procedures || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading procedures"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProcedures();
  }, []);

  const specialties = useMemo(() => {
    const uniqueSpecialties = [
      ...new Set(
        procedures
          .map((procedure) => procedure.specialty)
          .filter(Boolean)
      ),
    ];

    return uniqueSpecialties.sort();
  }, [procedures]);

  const filteredProcedures = useMemo(() => {
    return procedures.filter((procedure) => {
      const matchesSearch =
        procedure.procedure_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        procedure.procedure_id
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesSpecialty =
        selectedSpecialty === "All Specialties" ||
        procedure.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [procedures, searchTerm, selectedSpecialty]);

  return (
    <main className="procedure-page">
      <div className="procedure-container">

        {/* Hero */}
        <section className="procedure-hero">
          <div>
            <p className="procedure-eyebrow">
              CAREBRIDGE AI
            </p>

            <h1>Medical Procedure Explorer</h1>

            <p>
              Browse medical procedures and explore available
              specialties in the CareBridge healthcare network.
            </p>
          </div>

          <div className="procedure-hero-icon">
            ⚕
          </div>
        </section>

        {/* Search Card */}
        <section className="procedure-search-card">
          <p className="section-label">
            PROCEDURE DIRECTORY
          </p>

          <h2>Find a Medical Procedure</h2>

          <p className="procedure-description">
            Search by procedure name or filter procedures by specialty.
          </p>

          <div className="procedure-controls">

            <div className="procedure-field procedure-search-field">
              <label>Search Procedure</label>

              <input
                type="text"
                placeholder="Search by procedure name or ID..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="procedure-field">
              <label>Medical Specialty</label>

              <select
                value={selectedSpecialty}
                onChange={(event) =>
                  setSelectedSpecialty(event.target.value)
                }
              >
                <option value="All Specialties">
                  All Specialties
                </option>

                {specialties.map((specialty) => (
                  <option
                    key={specialty}
                    value={specialty}
                  >
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="procedure-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="procedure-loading">
            Loading medical procedures...
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            <section className="procedure-results-header">
              <div>
                <p className="section-label">
                  AVAILABLE PROCEDURES
                </p>

                <h2>Explore Medical Procedures</h2>

                <p>
                  Browse procedures available in the CareBridge
                  prototype dataset.
                </p>
              </div>

              <div className="procedure-count">
                <strong>
                  {filteredProcedures.length}
                </strong>

                <span>
                  Procedure
                  {filteredProcedures.length !== 1
                    ? "s"
                    : ""}
                </span>
              </div>
            </section>

            {filteredProcedures.length === 0 ? (
              <div className="no-procedures">
                <div className="procedure-empty-icon">
                  🔍
                </div>

                <h3>No Procedures Found</h3>

                <p>
                  Try changing your search or selecting
                  another specialty.
                </p>
              </div>
            ) : (
              <section className="procedure-grid">
                {filteredProcedures.map((procedure) => (
                  <article
                    className="procedure-card"
                    key={procedure.procedure_id}
                  >
                    <div className="procedure-card-top">
                      <div className="procedure-card-icon">
                        ⚕
                      </div>

                      <span className="specialty-badge">
                        {procedure.specialty}
                      </span>
                    </div>

                    <h3>
                      {procedure.procedure_name}
                    </h3>

                    <div className="procedure-divider" />

                    <div className="procedure-info">
                      <span>Procedure ID</span>

                      <strong>
                        {procedure.procedure_id}
                      </strong>
                    </div>

                    <div className="procedure-info">
                      <span>Specialty</span>

                      <strong>
                        {procedure.specialty}
                      </strong>
                    </div>

                    <button className="procedure-button">
                      Explore Procedure →
                    </button>
                  </article>
                ))}
              </section>
            )}

            {/* Info */}
            <section className="procedure-info-card">
              <div className="procedure-info-icon">
                ℹ
              </div>

              <div>
                <h3>About This Directory</h3>

                <p>
                  This directory helps users browse medical
                  procedures and specialties available in the
                  CareBridge AI prototype. Procedure information
                  is based on synthetic demonstration data.
                </p>
              </div>
            </section>
          </>
        )}

        {/* Disclaimer */}
        <div className="procedure-disclaimer">
          <strong>Disclaimer:</strong>{" "}
          Procedure information is based on the available
          synthetic prototype dataset and is intended only
          for demonstration purposes.
        </div>

      </div>
    </main>
  );
}