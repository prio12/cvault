import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCVStore } from "../store/useCVStore";
import CVAttributeField from "../components/cv/CVAttributeField";

export default function CVPage() {
  const { id } = useParams<{ id: string }>();
  const {
    current,
    loading,
    error,
    publishError,
    fetchCV,
    publish,
    clearPublishError,
  } = useCVStore();

  useEffect(() => {
    if (id) fetchCV(id);
  }, [id, fetchCV]);

  if (loading)
    return (
      <div className="p-8">
        <span className="loading loading-spinner" />
      </div>
    );
  if (error)
    return (
      <div className="p-8">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  if (!current) return null;

  const handlePublish = async () => {
    await publish();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">{current.candidateName}</h1>
        <span
          className={`badge ${current.status === "PUBLISHED" ? "badge-primary" : "badge-ghost"}`}
        >
          {current.status}
        </span>
      </div>
      <p className="text-base-content/60 mb-6">
        CV for {current.position.title}
        {current.position.company ? ` at ${current.position.company}` : ""}
      </p>

      {publishError && (
        <div className="alert alert-warning mb-4">
          <div>
            <p className="font-medium">Can't publish yet — missing:</p>
            <p className="text-sm">{publishError.missing.join(", ")}</p>
          </div>
          <button className="btn btn-sm" onClick={clearPublishError}>
            Dismiss
          </button>
        </div>
      )}

      <div className="card bg-base-100 p-4 sm:p-6 divide-y divide-base-300">
        {current.attributes.map((attr) => (
          <CVAttributeField
            key={attr.attributeId}
            attr={attr}
            editable={current.canEdit}
          />
        ))}
      </div>

      {current.canEdit && current.status === "DRAFT" && (
        <button className="btn btn-primary mt-6" onClick={handlePublish}>
          Publish CV
        </button>
      )}
    </div>
  );
}
