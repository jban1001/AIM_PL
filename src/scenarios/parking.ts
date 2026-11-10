import type { Scenario } from "../domain/types.ts";
import { conservativeResult, normalizeReportBody } from "../services/reportInput.ts";

const exampleInput = "성수 공영주차장에 주차 공간이 남아 있어요. 입구에서 대기 없이 들어갈 수 있어요.";
export const parking: Scenario = {
  id: "parking",
  name: "주차 제보",
  exampleInput,
  vehicleData: { location: "성수 공영주차장", gear: "P" },
  examples: [{ category: "주차", summary: "성수 공영주차장 여유 공간 제보", evidence: "" }],
  process: (body) => normalizeReportBody(body) === normalizeReportBody(exampleInput)
    ? { category: "주차", summary: "성수 공영주차장 여유 공간 제보", evidence: "" }
    : conservativeResult(body),
};
