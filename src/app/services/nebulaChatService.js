// src/services/nebulaChatService.js

export async function sendNebulaChat(message) {
  try {
    const response = await fetch("/api/nebula-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      console.error("Error response:", response.status, await response.text());
      return;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending Nebula chat request:", error);
  }
}
