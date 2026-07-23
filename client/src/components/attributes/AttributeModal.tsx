import { useState } from "react";
import type { Attribute, DataType } from "../../store/useAttributeStore";

const CATEGORIES = [
  "Certification",
  "Domain Knowledge",
  "Personal Information",
  "Soft Skills",
  "Language",
  "Technical Skills",
];

const DATA_TYPES: DataType[] = [
  "STRING",
  "TEXT",
  "NUMERIC",
  "BOOLEAN",
  "DATE",
  "DROPDOWN",
  "IMAGE",
];

export default function AttributeModal({
  attribute,
  onClose,
  onSave,
}: {
  attribute: Attribute | null;
  onClose: () => void;
  onSave: (data: Omit<Attribute, "id">) => void;
}) {
  const [name, setName] = useState(attribute?.name || "");
  const [cat, setCat] = useState(attribute?.category || CATEGORIES[0]);
  const [dataType, setDataType] = useState<DataType>(
    attribute?.dataType || "STRING",
  );
  const [description, setDescription] = useState(attribute?.description || "");
  const [optionsText, setOptionsText] = useState(
    (attribute?.options || []).join("\n"),
  );

  const handleSave = () => {
    const options =
      dataType === "DROPDOWN"
        ? optionsText
            .split("\n")
            .map((o) => o.trim())
            .filter(Boolean)
        : [];
    onSave({ name, category: cat, dataType, description, options });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">
          {attribute ? "Edit Attribute" : "New Attribute"}
        </h3>

        <label className="label">Name</label>
        <input
          className="input input-bordered w-full mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="label">Category</label>
        <select
          className="select select-bordered w-full mb-3"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="label">Data Type</label>
        <select
          className="select select-bordered w-full mb-3"
          value={dataType}
          onChange={(e) => setDataType(e.target.value as DataType)}
        >
          {DATA_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {dataType === "DROPDOWN" && (
          <>
            <label className="label">
              Options (one per line — e.g. Beginner / Intermediate / Advanced)
            </label>
            <textarea
              className="textarea textarea-bordered w-full mb-3"
              rows={4}
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              placeholder={"Beginner\nIntermediate\nAdvanced"}
            />
          </>
        )}

        <label className="label">Description (optional)</label>
        <textarea
          className="textarea textarea-bordered w-full mb-4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

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
