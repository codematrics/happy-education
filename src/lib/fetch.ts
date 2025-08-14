export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetcherOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
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

  const isJson = typeof body === "object" && body !== null;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": isJson ? "application/json" : "text/plain",
      ...headers,
    },
    credentials,
    body: body ? (isJson ? JSON.stringify(body) : (body as any)) : undefined,
    signal,
  });
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.message || "An error occurred");
    throw error;
  }

  return data;
}
