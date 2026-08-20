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


type HospitalRecommendationCardProps = {
  hospital: Recommendation;
  index: number;
};


export default function HospitalRecommendationCard({
  hospital,
  index,
}: HospitalRecommendationCardProps) {


  const formatCurrency = (
    amount: number
  ) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(amount);

  };


  const score =
    Math.round(
      hospital.recommendation_score
    );


  let matchLabel =
    "Consider Carefully";


  if (score >= 70) {

    matchLabel = "Excellent Match";

  } else if (score >= 50) {

    matchLabel = "Good Match";

  } else if (score >= 30) {

    matchLabel = "Consider Carefully";

  } else {

    matchLabel = "Limited Match";

  }


  return (

    <div
      className={`relative rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
        index === 0
          ? "border-green-400 ring-1 ring-green-200"
          : "border-slate-200"
      }`}
    >


      {/* Top recommendation badge */}
      {index === 0 && (

        <div className="mb-4 inline-flex rounded-full bg-green-700 px-4 py-1 text-sm font-semibold text-white">

          ★ Top Recommendation

        </div>

      )}


      {/* Rank and score */}
      <div className="flex items-start justify-between gap-4">


        <div>

          <p className="text-sm text-slate-500">

            Rank #{index + 1}

          </p>


          <h4 className="mt-2 text-xl font-bold leading-snug text-slate-800">

            {hospital.hospital_name}

          </h4>

        </div>


        <div className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">

          {score}%

        </div>


      </div>


      {/* City */}
      <p className="mt-5 text-slate-700">

        <strong>
          City:
        </strong>{" "}

        {hospital.city}

      </p>


      <hr className="my-5 border-slate-200" />


      {/* Cost details */}
      <div className="space-y-3">


        <p className="text-slate-700">

          <strong>
            Procedure Cost:
          </strong>{" "}

          {formatCurrency(
            hospital.procedure_cost
          )}

        </p>


        <p className="text-green-700">

          <strong>
            Insurance Pays:
          </strong>{" "}

          {formatCurrency(
            hospital.estimated_insurance_amount
          )}

        </p>


        <p className="font-semibold text-blue-800">

          Your Estimated Cost:{" "}

          {formatCurrency(
            hospital.estimated_patient_amount
          )}

        </p>


        <p className="text-slate-700">

          <strong>
            Room Eligible:
          </strong>{" "}

          {hospital.room_eligible
            ? "✓ Yes"
            : "✗ No"}

        </p>


      </div>


      <hr className="my-5 border-slate-200" />


      {/* Match score */}
      <div className="flex items-center justify-between">

        <p className="font-semibold text-slate-700">

          Match Score

        </p>


        <p className="font-semibold text-orange-700">

          {matchLabel}

        </p>

      </div>


      {/* Progress bar */}
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-orange-500"
          style={{
            width: `${Math.min(
              Math.max(score, 0),
              100
            )}%`,
          }}
        />

      </div>


      <p className="mt-3 text-xs leading-relaxed text-slate-500">

        Based on estimated out-of-pocket cost and policy
        room eligibility.

      </p>


    </div>

  );
}