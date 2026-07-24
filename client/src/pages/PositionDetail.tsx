import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePositionStore, type Position } from "../store/usePositionStore";
import { useCVStore } from "../store/useCVStore";
import { useAuthStore } from "../store/useAuthStore";

export default function PositionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchPosition } = usePositionStore();
  const { createCV } = useCVStore();
  const { user } = useAuthStore();

  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchPosition(id)
      .then(setPosition)
      .finally(() => setLoading(false));
  }, [id, fetchPosition]);

  const handleGenerateCV = async () => {
    if (!id) return;
    setGenerating(true);
    const cvId = await createCV(id);
    setGenerating(false);
    if (cvId) navigate(`/cv/${cvId}`);
  };

  if (loading)
    return (
      <div className="p-8">
        <span className="loading loading-spinner" />
      </div>
    );
  if (!position) return <div className="p-8">Position not found.</div>;

  const isCandidate = user?.role === "CANDIDATE";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">{position.title}</h1>
      <p className="text-base-content/60 mb-4">
        {position.company || "—"} · {position.level || "Not specified"}
      </p>

      {position.description && (
        <p className="mb-6 whitespace-pre-wrap">{position.description}</p>
      )}

      <h2 className="font-semibold mb-2">Required Attributes</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {position.attributes.map((pa) => (
          <span key={pa.attributeId} className="badge badge-outline">
            {pa.attribute.name}
          </span>
        ))}
      </div>

      {user && isCandidate && (
        <button
          className="btn btn-primary"
          onClick={handleGenerateCV}
          disabled={generating}
        >
          {generating ? "Generating…" : "Generate CV for this Position"}
        </button>
      )}

      {!user && (
        <p className="text-sm text-base-content/60">
          Log in as a Candidate to generate a CV for this position.
        </p>
      )}
    </div>
  );
}
