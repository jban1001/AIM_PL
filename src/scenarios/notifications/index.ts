import { BlackIceScenario } from "./blackIce.ts";
import { ParkingScenario } from "./parking.ts";
import { TrafficScenario } from "./traffic.ts";
import { LocalScenario } from "./local.ts";
import type { ScenarioEventHandler } from "../../domain/notifications.ts";

export const simulationTabs = [
  { id: "parking", name: "주차", reportScenarioId: "parking", notification: ParkingScenario },
  { id: "traffic", name: "교통", reportScenarioId: "congestion", notification: TrafficScenario },
  { id: "local", name: "지역", reportScenarioId: "local", notification: LocalScenario },
  { id: "road-hazard", name: "도로 위험", reportScenarioId: "black-ice", notification: BlackIceScenario },
];

// Extend event rules here; the shared delivery UI never needs scenario branches.
export const notificationScenarios: ScenarioEventHandler[] = [
  ParkingScenario,
  TrafficScenario,
  LocalScenario,
  BlackIceScenario,
];
