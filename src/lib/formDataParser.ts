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

  const appendFormData = (formData: FormData, key: string, value: any) => {
    if (value === null || value === undefined || value === "") {
      return; // ✅ skip null, undefined, empty string
    }

    if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
      return;
    }

    if (isFile(value)) {
      formData.append(key, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        appendFormData(formData, `${key}[${index}]`, item);
      });
      return;
    }

    if (typeof value === "object") {
      Object.keys(value).forEach((prop) => {
        appendFormData(formData, `${key}[${prop}]`, value[prop]);
      });
      return;
    }

    // numbers, strings
    formData.append(key, String(value));
  };

  Object.entries(data).forEach(([key, value]) => {
    appendFormData(formData, key, value);
  });

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

    // Case: arr[] (push into array)
    const arrayPushMatch = key.match(/^([^\[]+)\[\]$/);
    if (arrayPushMatch) {
      const [, arrKey] = arrayPushMatch;

      if (!obj[arrKey]) obj[arrKey] = [];
      obj[arrKey].push(value instanceof File ? value : castValue(value));
      return;
    }

    // Normal key (handle duplicates → array)
    if (obj[key] !== undefined) {
      if (!Array.isArray(obj[key])) {
        obj[key] = [obj[key]];
      }
      obj[key].push(value instanceof File ? value : castValue(value));
    } else {
      obj[key] = value instanceof File ? value : castValue(value);
    }
  });

  return obj;
};

// helper to restore types
const castValue = (value: FormDataEntryValue): any => {
  if (typeof value !== "string") return value;

  // null string → null
  if (value === "null") return null;

  // boolean
  if (value === "1" || value === "0") return value === "1";

  // number
  if (!isNaN(Number(value)) && value.trim() !== "") return Number(value);

  return value;
};
