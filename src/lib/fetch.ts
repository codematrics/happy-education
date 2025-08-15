export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetcherOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
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
  } = options;

  const isFormData = body instanceof FormData;
  const isJson = typeof body === "object" && body !== null && !isFormData;

  // Ensure we are working with a plain object for headers
  const finalHeaders: Record<string, string> = normalizeHeaders(headers);

  if (isJson) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    credentials,
    signal,
    body: body ? (isJson ? JSON.stringify(body) : (body as any)) : undefined,
  });

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
}
