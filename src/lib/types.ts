// ── User ────────────────────────────────────────────────────────────────────

export interface KarmaBand {
  band: string | null;
  display_text: string | null;
  show_medal: boolean | null;
  karma_score: number | null;
}

export interface SocialClub {
  social_club_id: number | null;
  name: string | null;
  photo_url: string | null;
  num_members: number | null;
  description: string | null;
}

export interface UserProfile {
  user_id: number | null;
  name: string | null;
  photo_url: string | null;
  username: string | null;
  displayname: string | null;
  bio: string | null;
  twitter: string | null;
  instagram: string | null;
  num_followers: number | null;
  num_following: number | null;
  follows_me: boolean | null;
  url: string | null;
  social_clubs: SocialClub[] | null;
  social_clubs_count: number | null;
  karma_band: KarmaBand | null;
  is_blocked_by_network: boolean | null;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export interface StartPhoneAuthResponse {
  success: boolean;
  num_digits: number | null;
}

export interface CompleteAuthResponse {
  success: boolean;
  auth_token: string | null;
  user_id: number | null;
  feature_flags: string[] | null;
}

// ── Me ──────────────────────────────────────────────────────────────────────

export interface MeResponse {
  success: boolean;
  user_profile: UserProfile | null;
  following_ids: number[] | null;
  blocked_ids: number[] | null;
}

// ── Profile ─────────────────────────────────────────────────────────────────

export interface GetProfileResponse {
  user_profile: UserProfile | null;
}

// ── Feed ────────────────────────────────────────────────────────────────────

export interface FeedUser {
  user_id: number | null;
  name: string | null;
  username: string | null;
  photo_url: string | null;
  is_speaker: boolean | null;
}

export interface PrivacySettings {
  type: string | null;
  display_text: string | null;
  tooltip_text: string | null;
}

export interface FeedChannel {
  channel: string | null;
  channel_id: number | null;
  topic: string | null;
  is_private: boolean | null;
  is_social_mode: boolean | null;
  num_speakers: number | null;
  num_all: number | null;
  url: string | null;
  privacy_settings: PrivacySettings | null;
  social_club: SocialClub | null;
  users: FeedUser[] | null;
}

export interface FeedItem {
  channel: FeedChannel | null;
}

export interface FeedResponse {
  items: FeedItem[] | null;
}

// ── Channel / Room ──────────────────────────────────────────────────────────

export interface ChannelUser {
  user_id: number | null;
  name: string | null;
  photo_url: string | null;
  username: string | null;
  is_speaker: boolean | null;
  is_moderator: boolean | null;
  twitter: string | null;
  first_name: string | null;
  is_social_club_member: boolean | null;
  is_invited_as_speaker: boolean | null;
  is_followed_by_speaker: boolean | null;
  skintone: number | null;
}

export interface JoinChannelResponse {
  channel: string | null;
  channel_id: number | null;
  topic: string | null;
  is_private: boolean | null;
  is_social_mode: boolean | null;
  is_handraise_enabled: boolean | null;
  is_room_chat_available: boolean | null;
  url: string | null;
  token: string | null;
  agora_native_mute: boolean | null;
  pubnub_token: string | null;
  pubnub_origin: string | null;
  user_profile_id: number | null;
  channel_mode: string | null;
  privacy_settings: PrivacySettings | null;
  social_club: SocialClub | null;
  users: ChannelUser[] | null;
}

export interface LeaveChannelResponse {
  success: boolean;
}

export interface Reaction {
  id: number;
  emoji: string;
  is_paid: boolean;
  coins_price: number;
}

export interface ChannelMessage {
  message_id: string | null;
  user_profile: UserProfile | null;
  message: string | null;
  message_type: number | null;
  time_created: string | null;
  reaction: Reaction | null;
  target_user_profile: UserProfile | null;
}

export interface GetChannelMessagesResponse {
  success: boolean;
  messages: ChannelMessage[] | null;
}

export interface ChannelAudienceResponse {
  users: ChannelUser[] | null;
}

export interface SendReactionResponse {
  success: boolean;
}

// ── Search ──────────────────────────────────────────────────────────────────

export interface SearchItem {
  user_profile: UserProfile | null;
  social_club: SocialClub | null;
}

export interface SearchResponse {
  success: boolean | null;
  items: SearchItem[] | null;
}

// ── Discovery / Explore ─────────────────────────────────────────────────────

export interface DiscoveryFeedResponse {
  success: boolean;
  items: any[] | null;
}

// ── Social Club Detail ──────────────────────────────────────────────────────

export interface SocialClubDetail {
  social_club_id: number | null;
  name: string | null;
  description: string | null;
  slug: string | null;
  photo_url: string | null;
  num_members: number | null;
  num_followers: number | null;
  is_membership_open: boolean | null;
  is_public_content: boolean | null;
  url: string | null;
  share_url: string | null;
  rules: any[] | null;
  topics: any[] | null;
}

export interface GetSocialClubResponse {
  success: boolean;
  social_club: SocialClubDetail | null;
  permissions: any | null;
}

// ── Suggested Follows / Badges ──────────────────────────────────────────────

export interface SuggestedFollowsResponse {
  users: UserProfile[] | null;
}

export interface UserBadgesResponse {
  success: boolean;
  inbox_badge: number | null;
  activity_badge: number | null;
}

// ── Profile Feed / Surfer ───────────────────────────────────────────────────

export interface ProfileFeedResponse {
  success: boolean;
  items: any[] | null;
}

export interface SurferJoinChannelResponse {
  success: boolean;
}

// ── Settings ────────────────────────────────────────────────────────────────

export interface SettingsResponse {
  success: boolean;
  notifications_enabled: boolean | null;
  settings: any | null;
}

// ── Follow ──────────────────────────────────────────────────────────────────

export interface FollowResponse {
  success: boolean;
}
