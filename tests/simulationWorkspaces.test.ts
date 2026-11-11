import test from "node:test";
import assert from "node:assert/strict";
import { scenarios } from "../src/scenarios/index.ts";
import { simulationTabs } from "../src/scenarios/notifications/index.ts";
import { processReport } from "../src/services/mockCommunity.ts";
import { validateReportBody } from "../src/services/reportInput.ts";

test("주행 제한 OFF 전용 작성 모드는 주차와 지역 시뮬레이션에 적용한다", () => {
  assert.deepEqual(simulationTabs.filter((tab) => tab.reportMode === "dictation").map((tab) => tab.id), ["parking", "local"]);
});

test("도로 위험 시연은 주행 상태와 무관한 음성 자동 등록으로 고정 발화·제목·근거를 전달한다", async () => {
  const tab = simulationTabs.find((item) => item.id === "road-hazard")!;
  const parkingTab = simulationTabs.find((item) => item.id === "parking")!;
  assert.equal(tab.reportMode, "voice");
  assert.equal(tab.confirmRegistration, true);
  assert.notEqual(tab.reportMode, parkingTab.reportMode);
  assert.equal(tab.speed, parkingTab.speed);
  const scenario = scenarios.find((item) => item.id === tab.reportScenarioId)!;
  assert.equal(scenario.exampleInput, "인하대역 3번 출구쯤 블랙아이스 현상 발생해서 차들이 우회하고 있어요. 조심하세요");
  const post = await processReport(scenario, scenario.exampleInput, "nearby", [], false, { source: "touch", aiDelayMs: 0 });
  assert.equal(post.summary, "인하대역 3번 출구 방면 1차선 도로 블랙아이스 제보");
  assert.equal(post.originalBody, scenario.exampleInput);
  assert.equal(post.evidence, "차량 데이터 확인 결과, 인하대역 3번 출구 인근을 통과한 차량에서 결빙 위험 신호가 확인되어 해당 구간의 블랙아이스가 의심됩니다.");
  const event = tab.notification.createEvent("nearby");
  assert.equal(event.post.summary, post.summary);
  assert.equal(event.post.evidence, post.evidence);
  assert.equal(event.speech, "전방 약 100미터, 인하대역 3번 출구 방면에 블랙아이스 의심 제보가 있습니다. 차량들이 우회하고 있으니 주의해 주세요.");
  assert.notEqual(event.speech, post.evidence);
  const noVehicle = await processReport(scenario, scenario.exampleInput, "nearby", [], false, { vehicleDataAvailable: false, aiDelayMs: 0 });
  assert.equal(noVehicle.summary, post.summary);
  assert.equal(noVehicle.evidence, "");
  const arbitrary = await processReport(scenario, "인하대역 근처 길가에 물건이 떨어져 있어요", "nearby", [], false, { aiDelayMs: 0 });
  assert.equal(arbitrary.evidence, "");
  assert.notEqual(arbitrary.summary, post.summary);
});

test("4개 시뮬레이션은 각 유형의 음성 제보 등록과 수신 이벤트를 연결한다", async () => {
  assert.equal(simulationTabs.length, 4);
  const categories = ["주차", "교통", "지역 정보", "도로 위험"];
  for (const [index, tab] of simulationTabs.entries()) {
    const scenario = scenarios.find((item) => item.id === tab.reportScenarioId);
    assert.ok(scenario, `${tab.name} 작성 시나리오 누락`);
    assert.ok(validateReportBody(scenario.exampleInput));
    const post = await processReport(scenario, scenario.exampleInput, "nearby", [], false, { source: "voice" });
    assert.equal(post.category, categories[index]);
    assert.equal(post.community, "nearby");
    assert.equal(post.source, "voice");
    for (const community of ["nearby", "destination", "direction"] as const) {
      const received = tab.notification.createEvent(community);
      assert.equal(received.post.category, post.category);
      assert.equal(received.post.community, community);
      assert.ok(received.speech);
    }
  }
});

test("주차 시뮬레이션은 주행 제한 OFF 받아쓰기로 비룡 주차장 충전 불가 제보를 등록하고 같은 내용을 수신한다", async () => {
  const tab = simulationTabs.find((item) => item.id === "parking")!;
  assert.equal(tab.reportMode, "dictation");
  const scenario = scenarios.find((item) => item.id === tab.reportScenarioId)!;
  assert.ok(scenario.exampleInput.startsWith("주차장 지하 2층에서 충전기를 연결했는데"));
  const post = await processReport(scenario, scenario.exampleInput, "direction", [], false, {
    source: "touch",
  });
  assert.equal(post.summary, "비룡 주차장 지하 2층 전기차 충전이 안됨 제보");
  assert.equal(post.category, "주차");
  assert.equal(post.community, "direction");
  assert.ok(post.evidence.startsWith("시뮬레이션: "));
  assert.ok(post.evidence.includes("배터리 잔량은 25%"));
  const noVehicle = await processReport(scenario, scenario.exampleInput, "direction", [], false, {
    vehicleDataAvailable: false,
  });
  assert.equal(noVehicle.evidence, "");
  const received = tab.notification.createEvent("direction");
  assert.equal(received.post.summary, post.summary);
  assert.equal(received.distanceMeters, 450);
  assert.ok(received.speech.includes("비룡 주차장 지하 2층"));
});

test("지역 시뮬레이션은 작성 화면의 받아쓰기로 같은 제목을 등록·수신한다", async () => {
  const tab = simulationTabs.find((item) => item.id === "local")!;
  assert.equal(tab.reportMode, "dictation");
  assert.equal(tab.speed, 0.5);
  const scenario = scenarios.find((item) => item.id === tab.reportScenarioId)!;
  assert.ok(scenario.exampleInput.startsWith("인하대학교에 볼일이 있어서"));
  const post = await processReport(scenario, scenario.exampleInput, "destination", [], false, {
    source: "touch",
  });
  assert.equal(post.summary, "미추홀 구청 근처 국밥집 추천 제보");
  assert.equal(post.category, "지역 정보");
  assert.equal(post.community, "destination");
  assert.equal(post.evidence, "");
  const received = tab.notification.createEvent("destination");
  assert.equal(received.post.summary, post.summary);
  assert.ok(received.speech.includes("국밥집"));
});

test("교통 시뮬레이션은 인천대교 고정 발화로 제보하고 등록 글과 수신 카드가 같은 제목·근거를 쓴다", async () => {
  const tab = simulationTabs.find((item) => item.id === "traffic")!;
  const scenario = scenarios.find((item) => item.id === tab.reportScenarioId)!;
  assert.equal(
    scenario.exampleInput,
    "인천대교 진입 지점에서 차가 너무 막혀요. 조금 움직이다가 다시 멈추는 상황이 반복되고 있어요.",
  );
  const post = await processReport(scenario, scenario.exampleInput, "nearby", [], false, { source: "voice" });
  assert.equal(post.summary, "인천대교 진입 구간 교통 정체 제보");
  assert.ok(post.evidence.startsWith("차량 데이터 확인 결과, 최근 5분간 평균 주행 속도가 시속 8km"));
  const received = tab.notification.createEvent("nearby");
  assert.equal(received.post.summary, post.summary);
  assert.equal(received.post.evidence, post.evidence);
  const noVehicle = await processReport(scenario, scenario.exampleInput, "nearby", [], false, {
    vehicleDataAvailable: false,
  });
  assert.equal(noVehicle.evidence, "");
});
