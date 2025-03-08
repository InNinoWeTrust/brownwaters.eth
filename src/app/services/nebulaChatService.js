// src/services/nebulaChatService.js

export async function sendNebulaChat(message) {
  const apiKey = process.env.NEXT_PUBLIC_THIRDWEB_NEBULA_API_KEY; // Ensure this is set in your .env.local file
  try {
    const response = await fetch("https://nebula-api.thirdweb.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", response.status, errorText);
      return { error: `Error ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending Nebula chat request:", error);
    return { error: error.message || "Unknown error" };
  }
}
