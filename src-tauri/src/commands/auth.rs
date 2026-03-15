use tauri::State;

use crate::api::models::*;
use crate::state::AppState;

#[tauri::command]
pub async fn start_phone_auth(
    state: State<'_, AppState>,
    phone_number: String,
) -> Result<StartPhoneAuthResponse, String> {
    let client = state.client.lock().await;
    client
        .start_phone_auth(&phone_number)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn complete_auth(
    state: State<'_, AppState>,
    phone_number: String,
    password: String,
) -> Result<CompletePasswordAuthResponse, String> {
    let mut client = state.client.lock().await;
    client
        .complete_password_auth(&phone_number, &password)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_me(state: State<'_, AppState>) -> Result<MeResponse, String> {
    let client = state.client.lock().await;
    client.me().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn logout(state: State<'_, AppState>) -> Result<GenericResponse, String> {
    let mut client = state.client.lock().await;
    client.logout().await.map_err(|e| e.to_string())
}
