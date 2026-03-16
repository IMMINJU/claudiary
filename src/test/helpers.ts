import { NextRequest } from "next/server";

export function createRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
  } = {},
) {
  const { method = "GET", headers = {}, body } = options;
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers: new Headers(headers),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

export function apiKeyHeaders(key: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
}

export function jsonHeaders() {
  return { "Content-Type": "application/json" };
}
