use tauri::State;

use crate::api::models::*;
use crate::state::AppState;

#[tauri::command]
pub async fn get_feed(state: State<'_, AppState>) -> Result<FeedResponse, String> {
    let client = state.client.lock().await;
    client.get_feed().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_discovery_feed(
    state: State<'_, AppState>,
) -> Result<DiscoveryFeedResponse, String> {
    let client = state.client.lock().await;
    client
        .get_discovery_feed()
        .await
        .map_err(|e| e.to_string())
}
