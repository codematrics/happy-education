export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetcherOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
  timeout?: number;
}

function normalizeHeaders(headers: HeadersInit): Record<string, string> {
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return headers; // already Record<string, string>
}

export async function fetcher<TResponse = unknown, TBody = unknown>(
  url: string,
  options: FetcherOptions<TBody> = {}
): Promise<TResponse> {
  const {
    method = "GET",
    body,
    headers = {},
    credentials = "include",
    signal,
    timeout = 30000, // 30 second default timeout
  } = options;

  // Create timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Merge with existing signal if provided
  let finalSignal = controller.signal;
  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }

  const isFormData = body instanceof FormData;
  const isJson = typeof body === "object" && body !== null && !isFormData;

  // Ensure we are working with a plain object for headers
  const finalHeaders: Record<string, string> = normalizeHeaders(headers);

  if (isJson) {
    finalHeaders["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      credentials,
      signal: finalSignal,
      body: body ? (isJson ? JSON.stringify(body) : (body as any)) : undefined,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get("Content-Type") || "";
    const isJsonResponse = contentType.includes("application/json");

    const data = isJsonResponse ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        typeof data === "string"
          ? data
          : (data as any)?.message || "An error occurred";
      throw new Error(errorMessage);
    }

    return data as TResponse;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout - please try again");
      }
      throw error;
    }
    throw new Error("Network error - please check your connection");
  }
}
