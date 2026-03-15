use tauri::State;

use crate::api::models::*;
use crate::state::AppState;

#[tauri::command]
pub async fn join_channel(
    state: State<'_, AppState>,
    channel: String,
) -> Result<JoinChannelResponse, String> {
    let client = state.client.lock().await;
    client
        .join_channel(&channel)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn leave_channel(
    state: State<'_, AppState>,
    channel: String,
) -> Result<LeaveChannelResponse, String> {
    let client = state.client.lock().await;
    client
        .leave_channel(&channel)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_channel_messages(
    state: State<'_, AppState>,
    channel: String,
) -> Result<ChannelMessagesResponse, String> {
    let client = state.client.lock().await;
    client
        .get_channel_messages(&channel)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_channel_audience(
    state: State<'_, AppState>,
    channel: String,
) -> Result<ChannelAudienceResponse, String> {
    let client = state.client.lock().await;
    client
        .get_channel_audience(&channel)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn send_reaction(
    state: State<'_, AppState>,
    channel: String,
    reaction: String,
) -> Result<SendReactionResponse, String> {
    let client = state.client.lock().await;
    client
        .send_reaction(&channel, &reaction)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn active_ping(
    state: State<'_, AppState>,
    channel: String,
) -> Result<ActivePingResponse, String> {
    let client = state.client.lock().await;
    client
        .active_ping(&channel)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn surfer_join_channel(
    state: State<'_, AppState>,
    channel: String,
) -> Result<SurferJoinChannelResponse, String> {
    let client = state.client.lock().await;
    client
        .surfer_join_channel(&channel)
        .await
        .map_err(|e| e.to_string())
}
