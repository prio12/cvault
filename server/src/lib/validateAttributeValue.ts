import { DataType } from "../generated/client";

export function validateAttributeValue(
  dataType: DataType,
  value: string | null | undefined,
  options: string[] = [],
): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  switch (dataType) {
    case "NUMERIC":
      if (Number.isNaN(Number(value))) {
        return "Value must be a number";
      }
      return null;

    case "BOOLEAN":
      if (value !== "true" && value !== "false") {
        return 'Value must be "true" or "false"';
      }
      return null;

    case "DATE":
      if (Number.isNaN(Date.parse(value))) {
        return "Value must be a valid date";
      }
      return null;

    case "DROPDOWN":
      if (options.length > 0 && !options.includes(value)) {
        return `Value must be one of: ${options.join(", ")}`;
      }
      return null;

    default:
      return null;
  }
}
