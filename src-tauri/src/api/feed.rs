use super::client::ClubhouseClient;
use super::error::ApiError;
use super::models::*;

impl ClubhouseClient {
    /// Get the main feed (rooms / channels you might join).
    pub async fn get_feed(&self) -> Result<FeedResponse, ApiError> {
        self.require_auth()?;
        let body = serde_json::json!({});
        self.post("/api/get_feed_v3", &body).await
    }

    /// Get the discovery / explore feed.
    pub async fn get_discovery_feed(&self) -> Result<DiscoveryFeedResponse, ApiError> {
        self.require_auth()?;
        let body = serde_json::json!({});
        self.post("/api/get_discovery_feed", &body).await
    }
}
