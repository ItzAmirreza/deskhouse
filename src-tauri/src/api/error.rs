use thiserror::Error;

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("HTTP request failed: {0}")]
    Request(#[from] reqwest::Error),

    #[error("JSON serialization error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Not authenticated — call login first")]
    NotAuthenticated,

    #[error("API returned error: {0}")]
    ApiResponse(String),

    #[error("{0}")]
    Other(String),
}

impl From<ApiError> for String {
    fn from(err: ApiError) -> String {
        err.to_string()
    }
}
