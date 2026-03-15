import { invoke } from "@tauri-apps/api/core";
import type {
  StartPhoneAuthResponse,
  CompleteAuthResponse,
  MeResponse,
  FeedResponse,
  JoinChannelResponse,
  LeaveChannelResponse,
  GetChannelMessagesResponse,
  GetProfileResponse,
  SearchResponse,
  ChannelAudienceResponse,
  SendReactionResponse,
  FollowResponse,
  DiscoveryFeedResponse,
  GetSocialClubResponse,
  SuggestedFollowsResponse,
  UserBadgesResponse,
  ProfileFeedResponse,
  SurferJoinChannelResponse,
  SettingsResponse,
} from "./types";

// ── Helpers ─────────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function call<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (err) {
    const message = typeof err === "string" ? err : (err as Error).message ?? "Unknown error";
    throw new ApiError(message);
  }
}

// ── Auth ────────────────────────────────────────────────────────────────────

export function startPhoneAuth(phoneNumber: string) {
  return call<StartPhoneAuthResponse>("start_phone_auth", { phoneNumber });
}

export function completeAuth(phoneNumber: string, password: string) {
  return call<CompleteAuthResponse>("complete_auth", { phoneNumber, password });
}

export function logout() {
  return call<void>("logout");
}

// ── User / Profile ──────────────────────────────────────────────────────────

export function getMe() {
  return call<MeResponse>("get_me");
}

export function getProfile(userId: number) {
  return call<GetProfileResponse>("get_profile", { userId });
}

export function followUser(userId: number) {
  return call<FollowResponse>("follow_user", { userId });
}

// ── Feed ────────────────────────────────────────────────────────────────────

export function getFeed() {
  return call<FeedResponse>("get_feed");
}

// ── Channel / Room ──────────────────────────────────────────────────────────

export function joinChannel(channel: string) {
  return call<JoinChannelResponse>("join_channel", { channel });
}

export function leaveChannel(channel: string) {
  return call<LeaveChannelResponse>("leave_channel", { channel });
}

export function getChannelMessages(channel: string) {
  return call<GetChannelMessagesResponse>("get_channel_messages", { channel });
}

export function getChannelAudience(channel: string) {
  return call<ChannelAudienceResponse>("get_channel_audience", { channel });
}

export function sendReaction(channel: string, reaction: string) {
  return call<SendReactionResponse>("send_reaction", { channel, reaction });
}

// ── Active Ping ─────────────────────────────────────────────────────────────

export function activePing(channel: string) {
  return call<{ success: boolean }>("active_ping", { channel });
}

// ── Search ──────────────────────────────────────────────────────────────────

export function searchUsers(query: string) {
  return call<SearchResponse>("search_users", { query });
}

// ── Discovery / Explore ─────────────────────────────────────────────────────

export function getDiscoveryFeed() {
  return call<DiscoveryFeedResponse>("get_discovery_feed");
}

// ── Social Club ─────────────────────────────────────────────────────────────

export function getSocialClub(socialClubId: number) {
  return call<GetSocialClubResponse>("get_social_club", { socialClubId });
}

// ── Suggested Follows / Badges ──────────────────────────────────────────────

export function getSuggestedFollows() {
  return call<SuggestedFollowsResponse>("get_suggested_follows");
}

export function getUserBadges() {
  return call<UserBadgesResponse>("get_user_badges");
}

// ── Profile Feed / Surfer ───────────────────────────────────────────────────

export function getProfileFeed(userId: number) {
  return call<ProfileFeedResponse>("get_profile_feed", { userId });
}

export function surferJoinChannel(channel: string) {
  return call<SurferJoinChannelResponse>("surfer_join_channel", { channel });
}

// ── Settings ────────────────────────────────────────────────────────────────

export function getSettings() {
  return call<SettingsResponse>("get_settings");
}
