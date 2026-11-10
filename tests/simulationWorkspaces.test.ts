import test from "node:test";
import assert from "node:assert/strict";
import { scenarios } from "../src/scenarios/index.ts";
import { simulationTabs } from "../src/scenarios/notifications/index.ts";
import { processReport } from "../src/services/mockCommunity.ts";
import { validateReportBody } from "../src/services/reportInput.ts";

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
