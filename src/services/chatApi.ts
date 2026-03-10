// URL de la API del chat desde variables de configuración
import { CHAT_API_URL } from "../config/env";

// Tipos de datos para request y response del chat
import type { ChatRequest, ChatResponse } from "../models/chatApi";

// Función que envía un mensaje al backend del chat
export async function sendMessage(
    payload: ChatRequest // Datos enviados a la API
): Promise<ChatResponse> {

    // Verifica que la URL de la API esté configurada
    if (!CHAT_API_URL) {
        throw new Error("CHAT_API_URL not configured");
    }

    // Realiza la petición HTTP POST al backend
    const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json", // Indica que el body es JSON
        },
        body: JSON.stringify(payload), // Convierte el payload a JSON
    });

    // Si la API devuelve error HTTP
    if (!response.ok) {
        throw new Error("Error calling chat API");
    }

    // Devuelve la respuesta de la API en formato JSON
    return response.json();
}