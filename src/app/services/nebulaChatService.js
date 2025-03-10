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
