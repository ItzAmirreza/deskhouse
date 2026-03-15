use super::client::ClubhouseClient;
use super::error::ApiError;
use super::models::*;

impl ClubhouseClient {
    /// Get user badge counts.
    pub async fn get_user_badges(&self) -> Result<UserBadgesResponse, ApiError> {
        self.require_auth()?;
        let body = serde_json::json!({});
        self.post("/api/get_user_badges", &body).await
    }

    /// Get user settings.
    pub async fn get_settings(&self) -> Result<SettingsResponse, ApiError> {
        self.require_auth()?;
        let body = serde_json::json!({});
        self.post("/api/get_settings", &body).await
    }
}
