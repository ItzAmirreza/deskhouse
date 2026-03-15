use super::client::ClubhouseClient;
use super::error::ApiError;
use super::models::*;

impl ClubhouseClient {
    /// Step 1: request an SMS / verification code.
    pub async fn start_phone_auth(
        &self,
        phone_number: &str,
    ) -> Result<StartPhoneAuthResponse, ApiError> {
        let body = StartPhoneAuthRequest {
            phone_number: phone_number.to_string(),
        };
        self.post("/api/start_phone_number_auth", &body).await
    }

    /// Step 2: complete auth with the code / password.
    /// Stores auth_token and user_id on success.
    pub async fn complete_password_auth(
        &mut self,
        phone_number: &str,
        password: &str,
    ) -> Result<CompletePasswordAuthResponse, ApiError> {
        let body = CompletePasswordAuthRequest {
            phone_number: phone_number.to_string(),
            password: password.to_string(),
        };
        let resp: CompletePasswordAuthResponse =
            self.post("/api/complete_password_auth", &body).await?;

        if resp.success {
            self.auth_token = resp.auth_token.clone();
            self.user_id = resp.user_id;
            self.save_credentials();
        }
        Ok(resp)
    }

    /// Fetch the authenticated user's profile.
    pub async fn me(&self) -> Result<MeResponse, ApiError> {
        self.require_auth()?;
        let body = MeRequest::default();
        self.post("/api/me", &body).await
    }

    /// Log out and clear local credentials.
    pub async fn logout(&mut self) -> Result<GenericResponse, ApiError> {
        self.require_auth()?;
        let body = serde_json::json!({});
        let resp: GenericResponse = self.post("/api/logout", &body).await?;
        self.clear_credentials();
        self.auth_token = None;
        self.user_id = None;
        Ok(resp)
    }
}
