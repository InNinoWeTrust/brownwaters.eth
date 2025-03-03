// app/api/nebula-chat/route.js
export async function POST(request) {
    const { message } = await request.json();
    const apiKey = process.env.NEBULA_API_KEY; // This remains secret on the server
  
    try {
      const response = await fetch("https://api-nebula.symbl.ai/v1/model/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ApiKey": apiKey,
        },
        body: JSON.stringify({
          max_new_tokens: 1024,
          top_p: 0.95,
          top_k: 1,
          system_prompt: "You are a helpful assistant.",
          messages: [
            {
              role: "human",
              text: message,
            },
          ],
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        return new Response(errorText, { status: response.status });
      }
      const data = await response.json();
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  