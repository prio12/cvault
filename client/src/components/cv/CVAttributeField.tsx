import { useState } from "react";
import { useCVStore, type CVAttribute } from "../../store/useCVStore";

const saveTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export default function CVAttributeField({
  attr,
  editable,
}: {
  attr: CVAttribute;
  editable: boolean;
}) {
  const { setAttributeValue, saveAttributeValue } = useCVStore();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">(
    "idle",
  );

  const isEmpty = attr.value === null || attr.value === "";

  const commit = (value: string, immediate: boolean) => {
    setAttributeValue(attr.attributeId, value);

    if (saveTimers[attr.attributeId])
      clearTimeout(saveTimers[attr.attributeId]);

    const doSave = async () => {
      setSaveState("saving");
      const ok = await saveAttributeValue(attr.attributeId, value);
      setSaveState(ok ? "idle" : "error");
    };

    if (immediate) {
      doSave();
    } else {
      saveTimers[attr.attributeId] = setTimeout(doSave, 4000);
    }
  };

  if (!editable) {
    return (
      <div className="py-2">
        <div className="text-xs text-base-content/60 mb-2">{attr.name}</div>
        <div className={isEmpty ? "text-error font-medium" : ""}>
          {isEmpty ? "(empty)" : attr.value}
        </div>
      </div>
    );
  }

  const wrapperClass = isEmpty ? "ring-1 ring-error rounded-md" : "";

  return (
    <div className="py-2">
      <div className="text-xs text-base-content/60 flex items-center gap-2 mb-2">
        {attr.name}
        {saveState === "saving" && (
          <span className="loading loading-spinner loading-xs" />
        )}
        {saveState === "error" && (
          <span className="text-error">save failed</span>
        )}
      </div>

      <div className={wrapperClass}>
        {attr.dataType === "BOOLEAN" && (
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={attr.value === "true"}
            onChange={(e) => commit(String(e.target.checked), true)}
          />
        )}

        {attr.dataType === "DROPDOWN" && (
          <select
            className="select select-bordered  select-sm w-full"
            value={attr.value ?? ""}
            onChange={(e) => commit(e.target.value, true)}
          >
            <option value="">— select —</option>
            {attr.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        {attr.dataType === "DATE" && (
          <input
            type="date"
            className="input input-bordered input-sm w-full"
            value={attr.value ?? ""}
            onChange={(e) => commit(e.target.value, true)}
          />
        )}

        {attr.dataType === "TEXT" && (
          <textarea
            className="textarea textarea-bordered textarea-sm w-full"
            value={attr.value ?? ""}
            onChange={(e) => commit(e.target.value, false)}
          />
        )}

        {(attr.dataType === "STRING" ||
          attr.dataType === "NUMERIC" ||
          attr.dataType === "IMAGE") && (
          <input
            type={attr.dataType === "NUMERIC" ? "number" : "text"}
            className="input input-bordered input-sm w-full"
            value={attr.value ?? ""}
            onChange={(e) => commit(e.target.value, false)}
          />
        )}
      </div>
    </div>
  );
}
