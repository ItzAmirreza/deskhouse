use tauri::State;

use crate::api::models::*;
use crate::state::AppState;

#[tauri::command]
pub async fn get_user_badges(
    state: State<'_, AppState>,
) -> Result<UserBadgesResponse, String> {
    let client = state.client.lock().await;
    client
        .get_user_badges()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_settings(
    state: State<'_, AppState>,
) -> Result<SettingsResponse, String> {
    let client = state.client.lock().await;
    client
        .get_settings()
        .await
        .map_err(|e| e.to_string())
}
