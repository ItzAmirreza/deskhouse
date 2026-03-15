use super::client::ClubhouseClient;
use super::error::ApiError;
use super::models::*;

impl ClubhouseClient {
    /// Get another user's profile by ID.
    pub async fn get_profile(&self, user_id: u64) -> Result<GetProfileResponse, ApiError> {
        self.require_auth()?;
        let body = GetProfileRequest { user_id };
        self.post("/api/get_profile", &body).await
    }

    /// Search for users (and clubs).
    pub async fn search(&self, query: &str) -> Result<SearchResponse, ApiError> {
        self.require_auth()?;
        let body = SearchRequest {
            query: query.to_string(),
            limit_to_object_types: vec![],
        };
        self.post("/api/search", &body).await
    }

    /// Follow a user by ID.
    pub async fn follow(&self, user_id: u64) -> Result<FollowResponse, ApiError> {
        self.require_auth()?;
        let body = FollowRequest { user_id };
        self.post("/api/follow", &body).await
    }

    /// Get suggested follows.
    pub async fn get_suggested_follows(&self) -> Result<SuggestedFollowsResponse, ApiError> {
        self.require_auth()?;
        self.get("/api/get_suggested_follows_all?in_onboarding=false&page_size=20&page=1").await
    }

    /// Get a user's profile feed.
    pub async fn get_profile_feed(&self, user_id: u64) -> Result<ProfileFeedResponse, ApiError> {
        self.require_auth()?;
        let body = GetProfileFeedRequest { user_id };
        self.post("/api/get_profile_feed", &body).await
    }
}
