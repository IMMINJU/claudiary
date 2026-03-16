import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRequest, jsonHeaders } from "@/test/helpers";

// Mock DB
const chainable = (returnValue: unknown = []) => {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "from", "where", "orderBy", "limit", "returning", "set", "values", "insert", "delete"];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.then = (resolve: (v: unknown) => void) => resolve(returnValue);
  return chain;
};

vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockImplementation(() =>
      chainable([{ id: "key-1", name: "test", keyPrefix: "cldy_abc", lastUsedAt: null, createdAt: new Date() }])
    ),
    insert: vi.fn().mockImplementation(() =>
      chainable([{ id: "key-2", name: "new-key", createdAt: new Date() }])
    ),
    delete: vi.fn().mockImplementation(() =>
      chainable([{ id: "key-1" }])
    ),
  },
  getDb: vi.fn(),
}));

// Mock session
vi.mock("@/lib/auth/session", () => ({
  requireSession: vi.fn(),
}));

import { GET, POST } from "../route";
import { DELETE } from "../[id]/route";
import { requireSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/api-response";

const mockRequireSession = vi.mocked(requireSession);

describe("POST /api/web/api-keys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로그인 상태 → 201 + key 원본 포함", async () => {
    mockRequireSession.mockResolvedValue([
      { user: { id: "user-1", name: "Test", email: "test@test.com" } },
      null,
    ]);

    const req = createRequest("/api/web/api-keys", {
      method: "POST",
      headers: jsonHeaders(),
      body: { name: "my-key" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.key).toBeDefined();
    expect(body.data.key).toMatch(/^cldy_/);
  });

  it("비로그인 → 401", async () => {
    mockRequireSession.mockResolvedValue([
      null,
      errorResponse("Unauthorized", 401),
    ]);

    const req = createRequest("/api/web/api-keys", {
      method: "POST",
      headers: jsonHeaders(),
      body: { name: "my-key" },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("name 누락 → 400", async () => {
    mockRequireSession.mockResolvedValue([
      { user: { id: "user-1", name: "Test", email: "test@test.com" } },
      null,
    ]);

    const req = createRequest("/api/web/api-keys", {
      method: "POST",
      headers: jsonHeaders(),
      body: {},
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/web/api-keys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로그인 상태 → 200 + 목록 (해시 미포함)", async () => {
    mockRequireSession.mockResolvedValue([
      { user: { id: "user-1", name: "Test", email: "test@test.com" } },
      null,
    ]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data[0]).not.toHaveProperty("keyHash");
    expect(body.data[0]).toHaveProperty("keyPrefix");
  });

  it("비로그인 → 401", async () => {
    mockRequireSession.mockResolvedValue([
      null,
      errorResponse("Unauthorized", 401),
    ]);

    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/web/api-keys/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("삭제 성공", async () => {
    mockRequireSession.mockResolvedValue([
      { user: { id: "user-1", name: "Test", email: "test@test.com" } },
      null,
    ]);

    const req = createRequest("/api/web/api-keys/key-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "key-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("비로그인 → 401", async () => {
    mockRequireSession.mockResolvedValue([
      null,
      errorResponse("Unauthorized", 401),
    ]);

    const req = createRequest("/api/web/api-keys/key-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "key-1" }) });
    expect(res.status).toBe(401);
  });
});
