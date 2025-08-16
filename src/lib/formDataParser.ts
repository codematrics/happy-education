export interface ParsedFormData {
  [key: string]: any;
}

export interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: any;
}

export const jsonToFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  const isFile = (value: unknown): value is File | Blob =>
    value instanceof File || value instanceof Blob;

  const entries = Object.entries(data);

  for (let i = 0; i < entries.length; i++) {
    const arKey = entries[i][0];
    let arVal = entries[i][1];

    if (typeof arVal === "boolean") {
      arVal = arVal ? 1 : 0;
    }

    if (Array.isArray(arVal)) {
      if (arVal.length === 0) continue;

      if (isFile(arVal[0])) {
        for (let z = 0; z < arVal.length; z++) {
          formData.append(`${arKey}[${z}]`, arVal[z]);
        }
        continue;
      } else if (typeof arVal[0] === "object" && arVal[0] !== null) {
        for (let j = 0; j < arVal.length; j++) {
          for (const prop in arVal[j]) {
            if (Object.prototype.hasOwnProperty.call(arVal[j], prop)) {
              const value = arVal[j][prop];
              formData.append(`${arKey}[${j}][${prop}]`, String(value));
            }
          }
        }
        continue;
      } else {
        // ✅ array of primitives (string, number, etc.)
        for (let z = 0; z < arVal.length; z++) {
          formData.append(`${arKey}[${z}]`, String(arVal[z]));
        }
        continue;
      }
    }

    if (arVal === null || arVal === undefined || arVal === "") {
      continue;
    }

    formData.append(arKey, String(arVal));
  }

  return formData;
};

export const formDataToJson = (formData: FormData): Record<string, any> => {
  const obj: Record<string, any> = {};

  formData.forEach((value, key) => {
    // Case: arr[0][prop]
    const objectMatch = key.match(/^([^\[]+)\[(\d+)\]\[([^\]]+)\]$/);
    if (objectMatch) {
      const [, arrKey, indexStr, prop] = objectMatch;
      const index = parseInt(indexStr, 10);

      if (!obj[arrKey]) obj[arrKey] = [];
      if (!obj[arrKey][index]) obj[arrKey][index] = {};

      obj[arrKey][index][prop] =
        value instanceof File ? value : castValue(value);
      return;
    }

    // Case: arr[0]
    const arrayMatch = key.match(/^([^\[]+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrKey, indexStr] = arrayMatch;
      const index = parseInt(indexStr, 10);

      if (!obj[arrKey]) obj[arrKey] = [];
      obj[arrKey][index] = value instanceof File ? value : castValue(value);
      return;
    }

    // Normal key
    obj[key] = value instanceof File ? value : castValue(value);
  });

  return obj;
};

// helper to restore types
const castValue = (value: FormDataEntryValue): any => {
  if (typeof value !== "string") return value;

  // boolean
  if (value === "1" || value === "0") return value === "1";

  // number
  if (!isNaN(Number(value)) && value.trim() !== "") return Number(value);

  return value;
};
