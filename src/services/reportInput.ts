import { mockConfig, type AIResult } from "../domain/types.ts";

export function normalizeReportBody(body: string) {
  return body
    .trim()
    .replace(/^[“"]?제보할게[”"]?[\s,.!，]*/u, "")
    .replace(/\s+/g, " ")
    .trim();
}
export function validateReportBody(body: string) {
  return normalizeReportBody(body).replace(/[\s.…!?]/g, "").length >= mockConfig.minReportChars;
}
// Deterministic Mock fallback, not keyword classification: never invent a road,
// cause, vehicle observation, or scenario label for arbitrary user text.
export function conservativeResult(body: string): AIResult {
  const original = normalizeReportBody(body);
  return {
    summary: original.length > 65 ? `${original.slice(0, 64)}…` : original,
    evidence: "",
    category: "기타",
  };
}
