import type { ScenarioEventHandler } from "../../domain/notifications.ts";
import { BLACK_ICE_SUMMARY, BLACK_ICE_EVIDENCE } from "../blackIce.ts";

// A stable source-post ID, shared across deliveries, is the global TTS dedupe key.
// This fixture contains no sensor, location, backend, or Pleos SDK integration.
export const BlackIceScenario: ScenarioEventHandler = {
  id: "black-ice-approach",
  name: "도로 위험 시뮬레이션",
  createEvent: (community, now = Date.now()) => ({
    post: {
      id: "mock-front-car-inha-black-ice",
      community,
      category: "도로 위험",
      summary: BLACK_ICE_SUMMARY,
      evidence: BLACK_ICE_EVIDENCE,
      createdAt: now - 3 * 60_000,
      authorId: "mock-front-car",
      simulated: true,
    },
    speech: BLACK_ICE_EVIDENCE,
    speechRate: 0.95 * 0.5,
    distanceMeters: 450,
    source: "앞차 제보 수신",
    receivedAt: now,
    simulated: true,
  }),
};
