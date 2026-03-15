use tauri::State;

use crate::api::models::*;
use crate::state::AppState;

#[tauri::command]
pub async fn get_profile(
    state: State<'_, AppState>,
    user_id: u64,
) -> Result<GetProfileResponse, String> {
    let client = state.client.lock().await;
    client
        .get_profile(user_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_users(
    state: State<'_, AppState>,
    query: String,
) -> Result<SearchResponse, String> {
    let client = state.client.lock().await;
    client.search(&query).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn follow_user(
    state: State<'_, AppState>,
    user_id: u64,
) -> Result<FollowResponse, String> {
    let client = state.client.lock().await;
    client.follow(user_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_suggested_follows(
    state: State<'_, AppState>,
) -> Result<SuggestedFollowsResponse, String> {
    let client = state.client.lock().await;
    client
        .get_suggested_follows()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_profile_feed(
    state: State<'_, AppState>,
    user_id: u64,
) -> Result<ProfileFeedResponse, String> {
    let client = state.client.lock().await;
    client
        .get_profile_feed(user_id)
        .await
        .map_err(|e| e.to_string())
}
