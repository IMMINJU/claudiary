import { describe, it, expect } from "vitest";
import { successResponse, errorResponse } from "../api-response";

describe("successResponse", () => {
  it("success: true + data + 기본 status 200", async () => {
    const res = successResponse({ id: "1" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, data: { id: "1" } });
  });

  it("커스텀 status", async () => {
    const res = successResponse({ id: "1" }, 201);
    expect(res.status).toBe(201);
  });
});

describe("errorResponse", () => {
  it("success: false + error + 기본 status 400", async () => {
    const res = errorResponse("bad input");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ success: false, error: "bad input" });
  });

  it("커스텀 status", async () => {
    const res = errorResponse("not found", 404);
    expect(res.status).toBe(404);
  });
});
