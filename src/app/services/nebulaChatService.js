// src/services/nebulaChatService.js



export async function sendNebulaChat(message) {
    const apiKey = process.env.NEBULA_API_KEY; // Ensure this is set in your environment
    try {
      const response = await fetch("https://api-nebula.symbl.ai/v1/model/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ApiKey": apiKey
        },
        body: JSON.stringify({
          max_new_tokens: 1024,
          top_p: 0.95,
          top_k: 1,
          system_prompt: "You are a helpful assistant.",
          messages: [
            {
              role: "human",
              text: message
            }
          ]
        })
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
  