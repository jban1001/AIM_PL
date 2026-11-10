import type { Scenario } from "../domain/types.ts";
import { conservativeResult, normalizeReportBody } from "../services/reportInput.ts";

const exampleInput = "성수동에서 주말 플리마켓이 열리고 있어요. 근처에 들르실 분들은 참고하세요.";
export const local: Scenario = {
  id: "local",
  name: "지역 제보",
  exampleInput,
  vehicleData: { location: "성수동" },
  examples: [{ category: "지역 정보", summary: "성수동 주말 플리마켓 개최 소식", evidence: "" }],
  process: (body) => normalizeReportBody(body) === normalizeReportBody(exampleInput)
    ? { category: "지역 정보", summary: "성수동 주말 플리마켓 개최 소식", evidence: "" }
    : conservativeResult(body),
};
