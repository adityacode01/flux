export function safeCallbackUrl(value, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : fallback;
}
