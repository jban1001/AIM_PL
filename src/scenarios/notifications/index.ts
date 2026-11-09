import { BlackIceScenario } from "./blackIce.ts";
import type { ScenarioEventHandler } from "../../domain/notifications.ts";

// Extend event rules here; the shared delivery UI never needs scenario branches.
export const notificationScenarios: ScenarioEventHandler[] = [BlackIceScenario];
