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
