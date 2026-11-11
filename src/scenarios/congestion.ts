import type { Scenario } from "../domain/types.ts";
import { conservativeResult, normalizeReportBody } from "../services/reportInput.ts";

const exampleInput =
  "인천대교 진입 지점에서 차가 너무 막혀요. 조금 움직이다가 다시 멈추는 상황이 반복되고 있어요.";
// 제보 등록 글과 수신 카드가 같은 제목·근거를 사용합니다.
export const TRAFFIC_SUMMARY = "인천대교 진입 구간 교통 정체 제보";
export const TRAFFIC_EVIDENCE =
  "차량 데이터 확인 결과, 최근 5분간 평균 주행 속도가 시속 8km로 낮고 정지와 출발이 6회 반복되어 해당 구간의 정체가 확인되었습니다.";
export const congestion: Scenario = {
  id: "congestion",
  name: "도로 정체 제보",
  exampleInput,
  vehicleData: {
    averageSpeed: 8,
    stops: 6,
    observation: "모의 저속·반복 정지",
    location: "인천대교 진입 구간",
  },
  examples: [
    {
      category: "교통",
      summary: "강변북로 성수 방면, 정체 관련 제보",
      evidence:
        "시뮬레이션: 저속 주행과 반복적인 정지가 설정되었습니다. 실제 차량 관측이 아닙니다.",
    },
    { category: "도로 위험", summary: "성수대교 북단, 블랙아이스 의심 제보", evidence: "" },
    { category: "주차", summary: "서울숲 공영주차장 만차 관련 제보", evidence: "" },
    { category: "지역 정보", summary: "성수역 주변 24시간 편의시설 안내", evidence: "" },
    { category: "기타", summary: "한강공원 진입로 주변 상황 제보", evidence: "" },
  ],
  process: (body, context) =>
    normalizeReportBody(body) === normalizeReportBody(exampleInput)
      ? {
          summary: TRAFFIC_SUMMARY,
          category: "교통",
          // 차량 데이터 조회 실패 시뮬레이션에서는 근거를 비웁니다.
          evidence: context.vehicleData.averageSpeed !== undefined ? TRAFFIC_EVIDENCE : "",
        }
      : conservativeResult(body),
};
