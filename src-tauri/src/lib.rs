mod api;
mod commands;
mod state;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            // Auth
            commands::auth::start_phone_auth,
            commands::auth::complete_auth,
            commands::auth::get_me,
            commands::auth::logout,
            // Feed
            commands::feed::get_feed,
            commands::feed::get_discovery_feed,
            // Channels
            commands::channel::join_channel,
            commands::channel::leave_channel,
            commands::channel::get_channel_messages,
            commands::channel::get_channel_audience,
            commands::channel::send_reaction,
            commands::channel::active_ping,
            commands::channel::surfer_join_channel,
            // Profile
            commands::profile::get_profile,
            commands::profile::search_users,
            commands::profile::follow_user,
            commands::profile::get_suggested_follows,
            commands::profile::get_profile_feed,
            // Social Club
            commands::social::get_social_club,
            // Settings
            commands::settings::get_user_badges,
            commands::settings::get_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
