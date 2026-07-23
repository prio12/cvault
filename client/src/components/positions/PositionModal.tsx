import { useEffect, useState } from "react";
import { useAttributeStore } from "../../store/useAttributeStore";
import type { Position, PositionInput } from "../../store/usePositionStore";

const LEVELS = ["Junior", "Middle", "Senior", "C-level"];

export default function PositionModal({
  position,
  onClose,
  onSave,
}: {
  position: Position | null;
  onClose: () => void;
  onSave: (data: PositionInput) => void;
}) {
  const { attributes, fetchAttributes } = useAttributeStore();

  const [title, setTitle] = useState(position?.title || "");
  const [company, setCompany] = useState(position?.company || "");
  const [description, setDescription] = useState(position?.description || "");
  const [level, setLevel] = useState(position?.level || LEVELS[0]);
  const [isPublic, setIsPublic] = useState(position?.isPublic ?? true);
  const [maxProjects, setMaxProjects] = useState(position?.maxProjects ?? 3);
  const [attrSearch, setAttrSearch] = useState("");

  const [selectedAttrIds, setSelectedAttrIds] = useState<Set<string>>(
    new Set(position?.attributes.map((pa) => pa.attributeId) || []),
  );

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const toggleAttr = (id: string) => {
    setSelectedAttrIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredAttrs = attributes.filter((a) =>
    a.name.toLowerCase().startsWith(attrSearch.toLowerCase()),
  );

  const handleSave = () => {
    onSave({
      title,
      company,
      description,
      level,
      isPublic,
      maxProjects,
      attributeIds: Array.from(selectedAttrIds),
    });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-h-[90vh] overflow-y-auto max-w-2xl">
        <h3 className="font-bold text-lg mb-4">
          {position ? "Edit Position" : "New Position"}
        </h3>

        <label className="label">Title</label>
        <input
          className="input input-bordered w-full mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="label">Company</label>
            <input
              className="input input-bordered w-full"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Level</label>
            <select
              className="select select-bordered w-full"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="label">Short Description</label>
        <textarea
          className="textarea textarea-bordered w-full mb-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="label-text">Public</span>
            </label>
          </div>
          <div>
            <label className="label">Max Projects in CV</label>
            <input
              type="number"
              min={0}
              className="input input-bordered w-full"
              value={maxProjects}
              onChange={(e) => setMaxProjects(Number(e.target.value))}
            />
          </div>
        </div>

        <label className="label">Attributes for this Position</label>
        <input
          className="input input-bordered input-sm w-full mb-2"
          placeholder="Search attributes by prefix…"
          value={attrSearch}
          onChange={(e) => setAttrSearch(e.target.value)}
        />
        <div className="border border-base-300 rounded-box max-h-48 overflow-y-auto p-2 mb-4">
          {filteredAttrs.length === 0 && (
            <p className="text-sm text-base-content/60 p-2">
              No attributes found.
            </p>
          )}
          {filteredAttrs.map((attr) => (
            <label
              key={attr.id}
              className="flex items-center gap-2 py-1 cursor-pointer"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary border-2 border-base-content/40"
                checked={selectedAttrIds.has(attr.id)}
                onChange={() => toggleAttr(attr.id)}
              />
              <span className="text-sm">{attr.name}</span>
              <span className="badge badge-ghost badge-sm">
                {attr.category}
              </span>
            </label>
          ))}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
