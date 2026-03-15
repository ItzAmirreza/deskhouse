use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct StartPhoneAuthRequest {
    pub phone_number: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(default)]
pub struct StartPhoneAuthResponse {
    pub success: bool,
    pub num_digits: Option<u32>,
}

impl Default for StartPhoneAuthResponse {
    fn default() -> Self {
        Self {
            success: false,
            num_digits: None,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct CompletePasswordAuthRequest {
    pub phone_number: String,
    pub password: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct CompletePasswordAuthResponse {
    pub success: bool,
    pub auth_token: Option<String>,
    pub user_id: Option<u64>,
    pub feature_flags: Option<Vec<String>>,
}

impl Default for CompletePasswordAuthResponse {
    fn default() -> Self {
        Self {
            success: false,
            auth_token: None,
            user_id: None,
            feature_flags: None,
        }
    }
}

// ---------------------------------------------------------------------------
// Me / User profile
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct MeRequest {
    pub is_cold_start: bool,
    pub return_following_ids: bool,
    pub return_blocked_ids: bool,
    pub timezone_identifier: String,
    pub return_requested_following_ids: bool,
    pub return_explore_segments_set: bool,
}

impl Default for MeRequest {
    fn default() -> Self {
        Self {
            is_cold_start: true,
            return_following_ids: true,
            return_blocked_ids: true,
            timezone_identifier: "UTC".to_string(),
            return_requested_following_ids: true,
            return_explore_segments_set: true,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct KarmaBand {
    pub band: Option<String>,
    pub display_text: Option<String>,
    pub show_medal: Option<bool>,
    pub karma_score: Option<u64>,
}

impl Default for KarmaBand {
    fn default() -> Self {
        Self {
            band: None,
            display_text: None,
            show_medal: None,
            karma_score: None,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct SocialClub {
    pub social_club_id: Option<u64>,
    pub name: Option<String>,
    pub photo_url: Option<String>,
    pub num_members: Option<u64>,
    pub description: Option<String>,
}

impl Default for SocialClub {
    fn default() -> Self {
        Self {
            social_club_id: None,
            name: None,
            photo_url: None,
            num_members: None,
            description: None,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct UserProfile {
    pub user_id: Option<u64>,
    pub name: Option<String>,
    pub username: Option<String>,
    pub photo_url: Option<String>,
    pub displayname: Option<String>,
    pub bio: Option<String>,
    pub twitter: Option<String>,
    pub instagram: Option<String>,
    pub num_followers: Option<u64>,
    pub num_following: Option<u64>,
    pub follows_me: Option<bool>,
    pub url: Option<String>,
    pub social_clubs: Option<Vec<SocialClub>>,
    pub social_clubs_count: Option<u64>,
    pub karma_band: Option<KarmaBand>,
    pub topics: Option<Vec<serde_json::Value>>,
    // Fields from /me response that may also appear
    pub email: Option<String>,
    pub phone_number: Option<String>,
    pub is_blocked_by_network: Option<bool>,
    pub pubnub_token: Option<String>,
    pub feature_flags: Option<Vec<String>>,
}

impl Default for UserProfile {
    fn default() -> Self {
        Self {
            user_id: None,
            name: None,
            username: None,
            photo_url: None,
            displayname: None,
            bio: None,
            twitter: None,
            instagram: None,
            num_followers: None,
            num_following: None,
            follows_me: None,
            url: None,
            social_clubs: None,
            social_clubs_count: None,
            karma_band: None,
            topics: None,
            email: None,
            phone_number: None,
            is_blocked_by_network: None,
            pubnub_token: None,
            feature_flags: None,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct MeResponse {
    pub success: bool,
    pub user_profile: Option<UserProfile>,
    pub following_ids: Option<Vec<u64>>,
    pub blocked_ids: Option<Vec<u64>>,
}

impl Default for MeResponse {
    fn default() -> Self {
        Self {
            success: false,
            user_profile: None,
            following_ids: None,
            blocked_ids: None,
        }
    }
}

// ---------------------------------------------------------------------------
// Profile / Search / Follow
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct GetProfileRequest {
    pub user_id: u64,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct GetProfileResponse {
    pub user_profile: Option<UserProfile>,
}

impl Default for GetProfileResponse {
    fn default() -> Self {
        Self {
            user_profile: None,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct SearchRequest {
    pub query: String,
    pub limit_to_object_types: Vec<String>,
}

impl Default for SearchRequest {
    fn default() -> Self {
        Self {
            query: String::new(),
            limit_to_object_types: vec![],
        }
    }
}

/// A single search result item that may contain either a user_profile or a social_club.
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct SearchItem {
    pub logging_context: Option<serde_json::Value>,
    pub user_profile: Option<UserProfile>,
    pub social_club: Option<SocialClub>,
}

impl Default for SearchItem {
    fn default() -> Self {
        Self {
            logging_context: None,
            user_profile: None,
            social_club: None,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct SearchResponse {
    pub success: Option<bool>,
    pub items: Option<Vec<SearchItem>>,
}

impl Default for SearchResponse {
    fn default() -> Self {
        Self {
            success: None,
            items: None,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct FollowRequest {
    pub user_id: u64,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct FollowResponse {
    pub success: bool,
}

impl Default for FollowResponse {
    fn default() -> Self {
        Self { success: false }
    }
}

// ---------------------------------------------------------------------------
// Privacy settings
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct PrivacySettings {
    #[serde(rename = "type")]
    pub type_: Option<String>,
    pub display_text: Option<String>,
    pub tooltip_text: Option<String>,
}

impl Default for PrivacySettings {
    fn default() -> Self {
        Self {
            type_: None,
            display_text: None,
            tooltip_text: None,
        }
    }
}

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------

/// A user as returned inside a feed channel's `users` array.
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct FeedUser {
    pub user_id: Option<u64>,
    pub name: Option<String>,
    pub username: Option<String>,
    pub photo_url: Option<String>,
    pub is_speaker: Option<bool>,
}

impl Default for FeedUser {
    fn default() -> Self {
        Self {
            user_id: None,
            name: None,
            username: None,
            photo_url: None,
            is_speaker: None,
        }
    }
}

/// The `channel` object nested inside each feed item.
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct FeedChannel {
    pub creator_user_profile_id: Option<u64>,
    pub channel_id: Option<u64>,
    pub channel: Option<String>,
    pub topic: Option<String>,
    pub is_private: Option<bool>,
    pub is_social_mode: Option<bool>,
    pub num_speakers: Option<u64>,
    pub num_all: Option<u64>,
    pub url: Option<String>,
    pub privacy_settings: Option<PrivacySettings>,
    pub social_club: Option<SocialClub>,
    pub users: Option<Vec<FeedUser>>,
}

impl Default for FeedChannel {
    fn default() -> Self {
        Self {
            creator_user_profile_id: None,
            channel_id: None,
            channel: None,
            topic: None,
            is_private: None,
            is_social_mode: None,
            num_speakers: None,
            num_all: None,
            url: None,
            privacy_settings: None,
            social_club: None,
            users: None,
        }
    }
}

/// Each element of the top-level `items` array wraps a `channel` object.
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct FeedItem {
    pub channel: Option<FeedChannel>,
}

impl Default for FeedItem {
    fn default() -> Self {
        Self { channel: None }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct FeedResponse {
    pub items: Option<Vec<FeedItem>>,
}

impl Default for FeedResponse {
    fn default() -> Self {
        Self { items: None }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct DiscoveryFeedResponse {
    pub success: bool,
    pub items: Option<Vec<serde_json::Value>>,
}

impl Default for DiscoveryFeedResponse {
    fn default() -> Self {
        Self {
            success: false,
            items: None,
        }
    }
}

// ---------------------------------------------------------------------------
// Channels / Rooms
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct JoinChannelRequest {
    pub channel: String,
    pub is_muted: bool,
}

impl Default for JoinChannelRequest {
    fn default() -> Self {
        Self {
            channel: String::new(),
            is_muted: true,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct ChannelUser {
    pub user_id: Option<u64>,
    pub name: Option<String>,
    pub photo_url: Option<String>,
    pub username: Option<String>,
    pub is_speaker: Option<bool>,
    pub is_moderator: Option<bool>,
    pub twitter: Option<String>,
    pub first_name: Option<String>,
    pub is_social_club_member: Option<bool>,
    pub is_invited_as_speaker: Option<bool>,
    pub is_followed_by_speaker: Option<bool>,
    pub skintone: Option<u32>,
}

impl Default for ChannelUser {
    fn default() -> Self {
        Self {
            user_id: None,
            name: None,
            photo_url: None,
            username: None,
            is_speaker: None,
            is_moderator: None,
            twitter: None,
            first_name: None,
            is_social_club_member: None,
            is_invited_as_speaker: None,
            is_followed_by_speaker: None,
            skintone: None,
        }
    }
}

/// join_channel returns a FLAT object (no `success` wrapper).
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct JoinChannelResponse {
    pub creator_user_profile_id: Option<u64>,
    pub channel_id: Option<u64>,
    pub channel: Option<String>,
    pub topic: Option<String>,
    pub is_private: Option<bool>,
    pub is_social_mode: Option<bool>,
    pub url: Option<String>,
    pub is_handraise_enabled: Option<bool>,
    pub is_room_chat_available: Option<bool>,
    pub token: Option<String>,
    pub agora_native_mute: Option<bool>,
    pub pubnub_token: Option<String>,
    pub pubnub_origin: Option<String>,
    pub user_profile_id: Option<u64>,
    pub channel_mode: Option<String>,
    pub privacy_settings: Option<PrivacySettings>,
    pub social_club: Option<SocialClub>,
    pub users: Option<Vec<ChannelUser>>,
}

impl Default for JoinChannelResponse {
    fn default() -> Self {
        Self {
            creator_user_profile_id: None,
            channel_id: None,
            channel: None,
            topic: None,
            is_private: None,
            is_social_mode: None,
            url: None,
            is_handraise_enabled: None,
            is_room_chat_available: None,
            token: None,
            agora_native_mute: None,
            pubnub_token: None,
            pubnub_origin: None,
            user_profile_id: None,
            channel_mode: None,
            privacy_settings: None,
            social_club: None,
            users: None,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct LeaveChannelRequest {
    pub channel: String,
    pub source: String,
}

impl Default for LeaveChannelRequest {
    fn default() -> Self {
        Self {
            channel: String::new(),
            source: "leave_button".to_string(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct LeaveChannelResponse {
    pub success: bool,
}

impl Default for LeaveChannelResponse {
    fn default() -> Self {
        Self { success: false }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct ChannelMessage {
    pub message_id: Option<String>,
    pub user_profile: Option<UserProfile>,
    pub message: Option<String>,
    pub message_type: Option<serde_json::Value>,
    pub time_created: Option<String>,
    pub reaction: Option<serde_json::Value>,
    pub reactions: Option<Vec<serde_json::Value>>,
}

impl Default for ChannelMessage {
    fn default() -> Self {
        Self {
            message_id: None,
            user_profile: None,
            message: None,
            message_type: None,
            time_created: None,
            reaction: None,
            reactions: None,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct ChannelMessagesResponse {
    pub success: bool,
    pub messages: Option<Vec<ChannelMessage>>,
}

impl Default for ChannelMessagesResponse {
    fn default() -> Self {
        Self {
            success: false,
            messages: None,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct GetChannelAudienceRequest {
    pub channel: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct ChannelAudienceResponse {
    pub users: Option<Vec<ChannelUser>>,
}

impl Default for ChannelAudienceResponse {
    fn default() -> Self {
        Self { users: None }
    }
}

#[derive(Debug, Serialize)]
pub struct SendReactionRequest {
    pub channel: String,
    pub reaction: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct SendReactionResponse {
    pub success: bool,
}

impl Default for SendReactionResponse {
    fn default() -> Self {
        Self { success: false }
    }
}

#[derive(Debug, Serialize)]
pub struct ActivePingRequest {
    pub channel: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct ActivePingResponse {
    pub success: bool,
}

impl Default for ActivePingResponse {
    fn default() -> Self {
        Self { success: false }
    }
}

#[derive(Debug, Serialize)]
pub struct PreviewJoinChannelRequest {
    pub channel: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct PreviewJoinChannelResponse {
    pub success: bool,
    pub channel: Option<String>,
    pub topic: Option<String>,
    pub users: Option<Vec<ChannelUser>>,
    pub num_all: Option<u64>,
}

impl Default for PreviewJoinChannelResponse {
    fn default() -> Self {
        Self {
            success: false,
            channel: None,
            topic: None,
            users: None,
            num_all: None,
        }
    }
}

// ---------------------------------------------------------------------------
// Social Club Detail
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct GetSocialClubRequest {
    pub social_club_id: u64,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct SocialClubDetail {
    pub social_club_id: Option<u64>,
    pub name: Option<String>,
    pub description: Option<String>,
    pub slug: Option<String>,
    pub photo_url: Option<String>,
    pub num_members: Option<u64>,
    pub num_followers: Option<u64>,
    pub is_membership_open: Option<bool>,
    pub is_public_content: Option<bool>,
    pub url: Option<String>,
    pub share_url: Option<String>,
    pub rules: Option<Vec<serde_json::Value>>,
    pub topics: Option<Vec<serde_json::Value>>,
}

impl Default for SocialClubDetail {
    fn default() -> Self {
        Self {
            social_club_id: None,
            name: None,
            description: None,
            slug: None,
            photo_url: None,
            num_members: None,
            num_followers: None,
            is_membership_open: None,
            is_public_content: None,
            url: None,
            share_url: None,
            rules: None,
            topics: None,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct GetSocialClubResponse {
    pub success: bool,
    pub social_club: Option<SocialClubDetail>,
    pub permissions: Option<serde_json::Value>,
}

impl Default for GetSocialClubResponse {
    fn default() -> Self {
        Self {
            success: false,
            social_club: None,
            permissions: None,
        }
    }
}

// ---------------------------------------------------------------------------
// Suggested Follows
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct SuggestedFollowsResponse {
    pub users: Option<Vec<UserProfile>>,
}

impl Default for SuggestedFollowsResponse {
    fn default() -> Self {
        Self { users: None }
    }
}

// ---------------------------------------------------------------------------
// User Badges
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct UserBadgesResponse {
    pub success: bool,
    pub inbox_badge: Option<u64>,
    pub activity_badge: Option<u64>,
}

impl Default for UserBadgesResponse {
    fn default() -> Self {
        Self {
            success: false,
            inbox_badge: None,
            activity_badge: None,
        }
    }
}

// ---------------------------------------------------------------------------
// Profile Feed
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct GetProfileFeedRequest {
    pub user_id: u64,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct ProfileFeedResponse {
    pub success: bool,
    pub items: Option<Vec<serde_json::Value>>,
}

impl Default for ProfileFeedResponse {
    fn default() -> Self {
        Self {
            success: false,
            items: None,
        }
    }
}

// ---------------------------------------------------------------------------
// Surfer Join Channel
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
pub struct SurferJoinChannelRequest {
    pub channel: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct SurferJoinChannelResponse {
    pub success: bool,
}

impl Default for SurferJoinChannelResponse {
    fn default() -> Self {
        Self { success: false }
    }
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct SettingsResponse {
    pub success: bool,
    pub notifications_enabled: Option<bool>,
    pub settings: Option<serde_json::Value>,
}

impl Default for SettingsResponse {
    fn default() -> Self {
        Self {
            success: false,
            notifications_enabled: None,
            settings: None,
        }
    }
}

// ---------------------------------------------------------------------------
// Generic / Utility
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct GenericResponse {
    pub success: bool,
}

impl Default for GenericResponse {
    fn default() -> Self {
        Self { success: false }
    }
}
