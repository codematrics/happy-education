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
      // ✅ Skip empty arrays
      if (arVal.length === 0) {
        continue;
      }

      if (isFile(arVal[0])) {
        for (let z = 0; z < arVal.length; z++) {
          formData.append(`${arKey}[]`, arVal[z]);
        }
        continue;
      } else if (typeof arVal[0] === "object" && arVal[0] !== null) {
        for (let j = 0; j < arVal.length; j++) {
          if (typeof arVal[j] === "object" && arVal[j] !== null) {
            for (const prop in arVal[j]) {
              if (Object.prototype.hasOwnProperty.call(arVal[j], prop)) {
                const value = arVal[j][prop];
                if (!isNaN(Date.parse(value))) {
                  formData.append(
                    `${arKey}[${j}][${prop}]`,
                    new Date(value).toISOString()
                  );
                } else {
                  formData.append(`${arKey}[${j}][${prop}]`, value);
                }
              }
            }
          }
        }
        continue;
      } else {
        arVal = JSON.stringify(arVal);
      }
    }

    if (arVal === null || arVal === undefined) {
      continue;
    }

    formData.append(arKey, arVal);
  }

  return formData;
};

export const formDataToJson = (formData: FormData): Record<string, any> => {
  const obj: Record<string, any> = {};

  formData.forEach((value, key) => {
    // Check if key ends with [] (array)
    if (key.endsWith("[]")) {
      const cleanKey = key.slice(0, -2);
      if (!obj[cleanKey]) {
        obj[cleanKey] = [];
      }
      obj[cleanKey].push(value instanceof File ? value : String(value));
    }
    // Handle nested keys like arr[0][prop]
    else if (/\[\d+\]/.test(key)) {
      const match = key.match(/^([^\[]+)\[(\d+)\]\[([^\]]+)\]$/);
      if (match) {
        const [, arrKey, indexStr, prop] = match;
        const index = parseInt(indexStr, 10);
        if (!obj[arrKey]) obj[arrKey] = [];
        if (!obj[arrKey][index]) obj[arrKey][index] = {};
        obj[arrKey][index][prop] =
          value instanceof File ? value : String(value);
      }
    }
    // Handle normal keys
    else {
      obj[key] = value instanceof File ? value : String(value);
    }
  });

  return obj;
};
