use super::client::ClubhouseClient;
use super::error::ApiError;
use super::models::*;

impl ClubhouseClient {
    /// Join a channel/room.
    pub async fn join_channel(&self, channel: &str) -> Result<JoinChannelResponse, ApiError> {
        self.require_auth()?;
        let body = JoinChannelRequest {
            channel: channel.to_string(),
            is_muted: true,
        };
        self.post("/api/join_channel", &body).await
    }

    /// Leave a channel/room.
    pub async fn leave_channel(&self, channel: &str) -> Result<LeaveChannelResponse, ApiError> {
        self.require_auth()?;
        let body = LeaveChannelRequest {
            channel: channel.to_string(),
            source: "leave_button".to_string(),
        };
        self.post("/api/leave_channel", &body).await
    }

    /// Get messages for a channel.
    pub async fn get_channel_messages(
        &self,
        channel: &str,
    ) -> Result<ChannelMessagesResponse, ApiError> {
        self.require_auth()?;
        let path = format!(
            "/api/get_channel_messages?channel={}&is_chronological_order=false",
            channel
        );
        self.get(&path).await
    }

    /// Get the audience list for a channel.
    pub async fn get_channel_audience(
        &self,
        channel: &str,
    ) -> Result<ChannelAudienceResponse, ApiError> {
        self.require_auth()?;
        let body = GetChannelAudienceRequest {
            channel: channel.to_string(),
        };
        self.post("/api/get_channel_audience", &body).await
    }

    /// Send a reaction in a channel.
    pub async fn send_reaction(
        &self,
        channel: &str,
        reaction: &str,
    ) -> Result<SendReactionResponse, ApiError> {
        self.require_auth()?;
        let body = SendReactionRequest {
            channel: channel.to_string(),
            reaction: reaction.to_string(),
        };
        self.post("/api/send_channel_reaction", &body).await
    }

    /// Send an active ping to keep presence in a channel.
    pub async fn active_ping(
        &self,
        channel: &str,
    ) -> Result<ActivePingResponse, ApiError> {
        self.require_auth()?;
        let body = ActivePingRequest {
            channel: channel.to_string(),
        };
        self.post("/api/active_ping", &body).await
    }

    /// Preview a channel before joining.
    pub async fn preview_join_channel(
        &self,
        channel: &str,
    ) -> Result<PreviewJoinChannelResponse, ApiError> {
        self.require_auth()?;
        let body = PreviewJoinChannelRequest {
            channel: channel.to_string(),
        };
        self.post("/api/preview_join_channel", &body).await
    }

    /// Join a channel as a surfer (listener).
    pub async fn surfer_join_channel(&self, channel: &str) -> Result<SurferJoinChannelResponse, ApiError> {
        self.require_auth()?;
        let body = SurferJoinChannelRequest {
            channel: channel.to_string(),
        };
        self.post("/api/surfer_join_channel", &body).await
    }
}
