import { CHAT_API_URL } from "../config/env";
import type { ChatRequest, ChatResponse } from "../models/chatApi";

export async function sendMessage(
    payload: ChatRequest
): Promise<ChatResponse> {
    if (!CHAT_API_URL) {
        throw new Error("CHAT_API_URL not configured");
    }

    const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Error calling chat API");
    }

    return response.json();
}