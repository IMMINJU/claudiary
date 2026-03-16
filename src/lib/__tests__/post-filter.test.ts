import { describe, it, expect } from "vitest";

// PostList 컴포넌트의 필터 로직을 별도 함수로 추출해서 테스트
interface Post {
  id: string;
  title: string;
  status: string;
  tags: string[];
}

function filterPosts(
  posts: Post[],
  { status, tag, search }: { status: string; tag: string | null; search: string },
): Post[] {
  let result = posts;
  if (status !== "all") result = result.filter((p) => p.status === status);
  if (tag) result = result.filter((p) => p.tags.includes(tag));
  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  return result;
}

function getTagCounts(posts: Post[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const post of posts) {
    for (const tag of post.tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  return counts;
}

const posts: Post[] = [
  { id: "1", title: "Docker debugging", status: "published", tags: ["docker", "debugging"] },
  { id: "2", title: "CORS 삽질", status: "draft", tags: ["cors", "backend"] },
  { id: "3", title: "React hooks", status: "published", tags: ["react", "hooks"] },
  { id: "4", title: "K8s Ingress", status: "draft", tags: ["k8s", "debugging"] },
  { id: "5", title: "Next.js middleware", status: "published", tags: ["next.js"] },
];

describe("post filter", () => {
  it("status 필터 — published만", () => {
    const result = filterPosts(posts, { status: "published", tag: null, search: "" });
    expect(result).toHaveLength(3);
    expect(result.every((p) => p.status === "published")).toBe(true);
  });

  it("status 필터 — draft만", () => {
    const result = filterPosts(posts, { status: "draft", tag: null, search: "" });
    expect(result).toHaveLength(2);
  });

  it("태그 필터", () => {
    const result = filterPosts(posts, { status: "all", tag: "debugging", search: "" });
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(["1", "4"]);
  });

  it("검색 — 제목 매칭", () => {
    const result = filterPosts(posts, { status: "all", tag: null, search: "docker" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("검색 — 태그 매칭", () => {
    const result = filterPosts(posts, { status: "all", tag: null, search: "cors" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("검색 — 대소문자 무시", () => {
    const result = filterPosts(posts, { status: "all", tag: null, search: "REACT" });
    expect(result).toHaveLength(1);
  });

  it("검색 + 태그 + status 조합", () => {
    const result = filterPosts(posts, { status: "draft", tag: "debugging", search: "k8s" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("4");
  });

  it("결과 없음", () => {
    const result = filterPosts(posts, { status: "all", tag: null, search: "nonexistent" });
    expect(result).toHaveLength(0);
  });
});

describe("tag counts", () => {
  it("태그별 빈도를 정확히 계산", () => {
    const counts = getTagCounts(posts);
    expect(counts["debugging"]).toBe(2);
    expect(counts["react"]).toBe(1);
    expect(counts["next.js"]).toBe(1);
  });
});
