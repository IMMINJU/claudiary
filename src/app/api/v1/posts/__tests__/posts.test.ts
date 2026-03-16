import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRequest, apiKeyHeaders } from "@/test/helpers";

// Mock DB
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

const chainable = (returnValue: unknown = []) => {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "from", "where", "orderBy", "limit", "innerJoin", "returning", "set", "values"];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.execute = vi.fn().mockResolvedValue(returnValue);
  // 마지막 체인이 await되면 반환값
  chain.then = (resolve: (v: unknown) => void) => resolve(returnValue);
  return chain;
};

vi.mock("@/db", () => ({
  db: {
    select: (...args: unknown[]) => {
      mockSelect(...args);
      return chainable([])
    },
    insert: (...args: unknown[]) => {
      mockInsert(...args);
      return chainable([{ id: "post-1", userId: "user-1", title: "Test", slug: "test", content: "content", status: "draft", source: "skill", tags: [], createdAt: new Date(), updatedAt: new Date() }]);
    },
    update: (...args: unknown[]) => {
      mockUpdate(...args);
      return chainable([{ id: "post-1", status: "published", publishedAt: new Date() }]);
    },
    delete: (...args: unknown[]) => {
      mockDelete(...args);
      return chainable([{ id: "post-1" }]);
    },
  },
  getDb: vi.fn(),
}));

// Mock API Key 인증
vi.mock("@/lib/auth/verify-api-key", () => ({
  requireApiKey: vi.fn(),
}));

import { GET, POST } from "../route";
import { requireApiKey } from "@/lib/auth/verify-api-key";
import { errorResponse } from "@/lib/api-response";

const mockRequireApiKey = vi.mocked(requireApiKey);

describe("POST /api/v1/posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("유효한 API Key → 201 + draft 글 생성", async () => {
    mockRequireApiKey.mockResolvedValue([
      { id: "user-1", email: "test@test.com", name: "Test" },
      null,
    ]);

    const req = createRequest("/api/v1/posts", {
      method: "POST",
      headers: apiKeyHeaders("cldy_test"),
      body: { title: "Test Post", content: "Hello world" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.title).toBe("Test");
  });

  it("API Key 없음 → 401", async () => {
    mockRequireApiKey.mockResolvedValue([
      null,
      errorResponse("Missing or invalid Authorization header", 401),
    ]);

    const req = createRequest("/api/v1/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { title: "Test", content: "Hello" },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("title 누락 → 400", async () => {
    mockRequireApiKey.mockResolvedValue([
      { id: "user-1", email: "test@test.com", name: "Test" },
      null,
    ]);

    const req = createRequest("/api/v1/posts", {
      method: "POST",
      headers: apiKeyHeaders("cldy_test"),
      body: { content: "no title" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("유효한 API Key → 200 + 글 목록", async () => {
    mockRequireApiKey.mockResolvedValue([
      { id: "user-1", email: "test@test.com", name: "Test" },
      null,
    ]);

    const req = createRequest("/api/v1/posts", {
      headers: apiKeyHeaders("cldy_test"),
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("API Key 없음 → 401", async () => {
    mockRequireApiKey.mockResolvedValue([
      null,
      errorResponse("Unauthorized", 401),
    ]);

    const req = createRequest("/api/v1/posts");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
