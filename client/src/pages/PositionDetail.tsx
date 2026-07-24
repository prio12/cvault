import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { usePositionStore, type Position } from "../store/usePositionStore";
import { useCVStore } from "../store/useCVStore";
import { useAuthStore } from "../store/useAuthStore";

interface PositionCVRow {
  id: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  candidateName: string;
  likes: number;
}

export default function PositionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchPosition, fetchPositionCVs } = usePositionStore();
  const { createCV } = useCVStore();
  const { user } = useAuthStore();

  const [position, setPosition] = useState<Position | null>(null);
  const [cvs, setCvs] = useState<PositionCVRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const canViewCVs = user?.role === "RECRUITER" || user?.role === "ADMIN";
  const isCandidate = user?.role === "CANDIDATE";

  useEffect(() => {
    if (!id) return;
    fetchPosition(id)
      .then(setPosition)
      .finally(() => setLoading(false));
  }, [id, fetchPosition]);

  useEffect(() => {
    if (!id || !canViewCVs) return;
    fetchPositionCVs(id).then(setCvs);
  }, [id, canViewCVs, fetchPositionCVs]);

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
          className="btn btn-primary mb-8"
          onClick={handleGenerateCV}
          disabled={generating}
        >
          {generating ? "Generating…" : "Generate CV for this Position"}
        </button>
      )}

      {!user && (
        <p className="text-sm text-base-content/60 mb-8">
          Log in as a Candidate to generate a CV for this position.
        </p>
      )}

      {canViewCVs && (
        <>
          <h2 className="font-semibold mb-2">Submitted CVs</h2>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Status</th>
                  <th>Likes</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {cvs.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center text-base-content/60 py-6"
                    >
                      No CVs submitted yet.
                    </td>
                  </tr>
                )}
                {cvs.map((cv) => (
                  <tr key={cv.id} className="hover">
                    <td>
                      <Link to={`/cv/${cv.id}`} className="link link-primary">
                        {cv.candidateName}
                      </Link>
                    </td>
                    <td>
                      <span
                        className={`badge badge-sm ${cv.status === "PUBLISHED" ? "badge-primary" : "badge-ghost"}`}
                      >
                        {cv.status}
                      </span>
                    </td>
                    <td>{cv.likes}</td>
                    <td>{new Date(cv.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
