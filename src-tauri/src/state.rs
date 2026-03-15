use tokio::sync::Mutex;

use crate::api::client::ClubhouseClient;

pub struct AppState {
    pub client: Mutex<ClubhouseClient>,
}

impl AppState {
    pub fn new() -> Self {
        let mut client = ClubhouseClient::new();
        // Try to restore saved session from disk
        client.load_credentials();
        Self {
            client: Mutex::new(client),
        }
    }
}
