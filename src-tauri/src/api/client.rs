use reqwest::header::{HeaderMap, HeaderValue};
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;

use super::error::ApiError;

const BASE_URL: &str = "https://www.clubhouseapi.com";
const APP_BUILD: &str = "4321";
const APP_VERSION: &str = "26.03.05";
const APP_ID: &str = "clubhouse";
const USER_AGENT: &str = "clubhouse/4321 (iPhone; iOS 26.2; Scale/3.00)";
const LOCALE: &str = "en_AT";
const LANGUAGES: &str = "en-AT";

pub struct ClubhouseClient {
    http: reqwest::Client,
    base_url: String,
    device_id: String,
    pub auth_token: Option<String>,
    pub user_id: Option<u64>,
}

impl ClubhouseClient {
    /// Create a new client with a freshly generated device UUID.
    pub fn new() -> Self {
        Self {
            http: reqwest::Client::new(),
            base_url: BASE_URL.to_string(),
            device_id: Uuid::new_v4()
                .to_string()
                .to_uppercase(),
            auth_token: None,
            user_id: None,
        }
    }

    /// Build the common header set for every request.
    fn headers(&self) -> HeaderMap {
        let mut h = HeaderMap::new();

        h.insert("ch-deviceid", HeaderValue::from_str(&self.device_id).unwrap());
        h.insert("ch-appbuild", HeaderValue::from_static(APP_BUILD));
        h.insert("ch-appversion", HeaderValue::from_static(APP_VERSION));
        h.insert("ch-appid", HeaderValue::from_static(APP_ID));
        h.insert("ch-locale", HeaderValue::from_static(LOCALE));
        h.insert("ch-languages", HeaderValue::from_static(LANGUAGES));
        h.insert(
            reqwest::header::USER_AGENT,
            HeaderValue::from_static(USER_AGENT),
        );
        h.insert(
            reqwest::header::ACCEPT,
            HeaderValue::from_static("application/json"),
        );
        h.insert(
            reqwest::header::CONTENT_TYPE,
            HeaderValue::from_static("application/json; charset=utf-8"),
        );

        if let Some(ref token) = self.auth_token {
            if let Ok(val) = HeaderValue::from_str(&format!("Token {token}")) {
                h.insert(reqwest::header::AUTHORIZATION, val);
            }
        }
        if let Some(uid) = self.user_id {
            if let Ok(val) = HeaderValue::from_str(&uid.to_string()) {
                h.insert("ch-userid", val);
            }
        }

        h
    }

    /// Send a POST with a JSON body and deserialize the response.
    pub async fn post<B, R>(&self, path: &str, body: &B) -> Result<R, ApiError>
    where
        B: serde::Serialize,
        R: serde::de::DeserializeOwned,
    {
        let url = format!("{}{}", self.base_url, path);
        let resp = self
            .http
            .post(&url)
            .headers(self.headers())
            .json(body)
            .send()
            .await?;

        let status = resp.status();
        if !status.is_success() {
            let text = resp.text().await.unwrap_or_default();
            return Err(ApiError::ApiResponse(format!(
                "HTTP {status}: {text}"
            )));
        }

        let parsed = resp.json::<R>().await?;
        Ok(parsed)
    }

    /// Send a GET and deserialize the response.
    pub async fn get<R>(&self, path: &str) -> Result<R, ApiError>
    where
        R: serde::de::DeserializeOwned,
    {
        let url = format!("{}{}", self.base_url, path);
        let resp = self
            .http
            .get(&url)
            .headers(self.headers())
            .send()
            .await?;

        let status = resp.status();
        if !status.is_success() {
            let text = resp.text().await.unwrap_or_default();
            return Err(ApiError::ApiResponse(format!(
                "HTTP {status}: {text}"
            )));
        }

        let parsed = resp.json::<R>().await?;
        Ok(parsed)
    }

    /// Returns true when the client holds an auth token.
    pub fn is_authenticated(&self) -> bool {
        self.auth_token.is_some()
    }

    /// Convenience: error out if not authenticated.
    pub fn require_auth(&self) -> Result<(), ApiError> {
        if self.is_authenticated() {
            Ok(())
        } else {
            Err(ApiError::NotAuthenticated)
        }
    }

    // ── Credential persistence ──────────────────────────────────────────

    fn creds_path() -> Option<PathBuf> {
        dirs::data_local_dir().map(|d| d.join("deskhouse").join("credentials.json"))
    }

    /// Save current auth_token, user_id, and device_id to disk.
    pub fn save_credentials(&self) {
        if let (Some(path), Some(token), Some(uid)) =
            (Self::creds_path(), &self.auth_token, self.user_id)
        {
            let data = serde_json::json!({
                "auth_token": token,
                "user_id": uid,
                "device_id": &self.device_id,
            });
            if let Some(parent) = path.parent() {
                let _ = fs::create_dir_all(parent);
            }
            let _ = fs::write(&path, data.to_string());
        }
    }

    /// Try to load previously saved credentials. Returns true if restored.
    pub fn load_credentials(&mut self) -> bool {
        let path = match Self::creds_path() {
            Some(p) if p.exists() => p,
            _ => return false,
        };
        let data = match fs::read_to_string(&path) {
            Ok(d) => d,
            Err(_) => return false,
        };
        let json: serde_json::Value = match serde_json::from_str(&data) {
            Ok(v) => v,
            Err(_) => return false,
        };
        if let (Some(token), Some(uid)) = (
            json["auth_token"].as_str(),
            json["user_id"].as_u64(),
        ) {
            self.auth_token = Some(token.to_string());
            self.user_id = Some(uid);
            // Restore the same device_id to keep the session valid
            if let Some(did) = json["device_id"].as_str() {
                self.device_id = did.to_string();
            }
            return true;
        }
        false
    }

    /// Clear saved credentials from disk.
    pub fn clear_credentials(&self) {
        if let Some(path) = Self::creds_path() {
            let _ = fs::remove_file(path);
        }
    }
}
