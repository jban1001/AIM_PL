import test from "node:test";
import assert from "node:assert/strict";
import { preferredPosts } from "../src/domain/preferences.ts";
import { pagePosts, nextPagePosts } from "../src/services/mockCommunity.ts";
import type { Category, Post } from "../src/domain/types.ts";

const categories: Category[] = ["주차", "교통", "지역 정보", "도로 위험", "기타"];
const posts: Post[] = Array.from({ length: 150 }, (_, i) => ({
  id: `post-${i}`, community: "nearby", category: categories[i % categories.length],
  summary: "제보", evidence: "", createdAt: Date.now() - i * 1000, simulated: true,
}));

test("복수 선택한 범주만 남기며 지역은 지역 정보 게시글에 대응한다", () => {
  const result = preferredPosts(posts, ["주차", "지역 정보"]);
  assert.equal(result.length, 60);
  assert.ok(result.every((post) => post.category === "주차" || post.category === "지역 정보"));
  assert.equal(posts.length, 150);
  assert.equal(preferredPosts(posts, []).length, 0);
});

test("범주 필터를 페이지 분할 전에 적용해 첫 페이지와 더 보기를 채운다", () => {
  const all = preferredPosts(posts, ["도로 위험"]);
  const first = pagePosts(all, 0);
  const second = nextPagePosts(all, first);
  assert.equal(first.length, 20);
  assert.equal(second.length, 10);
  assert.equal(new Set([...first, ...second].map((post) => post.id)).size, 30);
  assert.ok([...first, ...second].every((post) => post.category === "도로 위험"));
  assert.equal(nextPagePosts(all, [...first, ...second]).length, 0);
});

test("새 글 개수에는 선택한 범주의 도착 글만 포함한다", () => {
  const pending = posts.slice(0, 5);
  assert.equal(preferredPosts(pending, ["교통", "주차"]).length, 2);
  assert.equal(preferredPosts(pending.filter((post) => post.category === "기타"), ["교통"]).length, 0);
});
