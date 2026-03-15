use super::client::ClubhouseClient;
use super::error::ApiError;
use super::models::*;

impl ClubhouseClient {
    /// Get details for a social club by ID.
    pub async fn get_social_club(&self, social_club_id: u64) -> Result<GetSocialClubResponse, ApiError> {
        self.require_auth()?;
        let body = GetSocialClubRequest { social_club_id };
        self.post("/api/get_social_club", &body).await
    }
}
