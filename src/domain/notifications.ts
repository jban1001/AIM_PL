import type { CommunityId, Post } from "./types.ts";

export type DrivingRestrictionState = "DRIVING_RESTRICTED" | "UNRESTRICTED";
export type CommunitySelectionState = CommunityId;
export interface MockNotificationData {
  post: Post;
  speech: string;
  distanceMeters: number;
  source: string;
  receivedAt: number;
  simulated: true;
}
export type NotificationHistory = Record<CommunityId, MockNotificationData[]>;
export type TTSStatus =
  | "idle"
  | "muted"
  | "queued"
  | "playing"
  | "simulating"
  | "played"
  | "blocked"
  | "unsupported"
  | "cancelled";
export interface TTSPlaybackState {
  status: TTSStatus;
  detail: string;
}
export interface ScenarioEventHandler {
  id: string;
  name: string;
  createEvent: (community: CommunityId, now?: number) => MockNotificationData;
}
export function emptyNotificationHistory(): NotificationHistory {
  return { nearby: [], destination: [], direction: [] };
}
export function recordNotification(
  history: NotificationHistory,
  incoming: MockNotificationData,
): NotificationHistory {
  const community = incoming.post.community;
  if (history[community].some((item) => item.post.id === incoming.post.id)) return history;
  return { ...history, [community]: [incoming, ...history[community]] };
}
export function upsertReceivedPost(posts: Post[], incoming: Post): Post[] {
  return [...posts.filter((post) => post.id !== incoming.id), incoming].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
}
