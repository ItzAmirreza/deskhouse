use tauri::State;

use crate::api::models::*;
use crate::state::AppState;

#[tauri::command]
pub async fn get_social_club(
    state: State<'_, AppState>,
    social_club_id: u64,
) -> Result<GetSocialClubResponse, String> {
    let client = state.client.lock().await;
    client
        .get_social_club(social_club_id)
        .await
        .map_err(|e| e.to_string())
}
