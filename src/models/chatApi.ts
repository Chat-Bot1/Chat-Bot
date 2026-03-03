export interface ChatRequest {
    session_id: string;
    request_id: string;
    text: string;
}

export interface ChatResponse {
    text: string;
}