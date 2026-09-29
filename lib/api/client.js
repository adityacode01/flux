export class ApiClientError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details; // per-field errors from Zod, when present
  }
}

async function request(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body (e.g. a network-level failure)
  }

  if (!res.ok || !body?.success) {
    const err = body?.error;
    throw new ApiClientError(err?.message ?? "Something went wrong. Please try again.", {
      status: res.status,
      code: err?.code,
      details: err?.details,
    });
  }
  return body.data;
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: "POST", body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

/** Builds a query string, skipping empty values. */
export function toQuery(params) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}
