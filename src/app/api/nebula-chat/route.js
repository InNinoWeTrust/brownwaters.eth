// app/api/nebula-chat/route.js

// For debugging purposes only—remove or secure this in production:
console.log("Using Nebula API key:", process.env.NEBULA_API_KEY);

export async function POST(request) {
  const { message } = await request.json();
  const apiKey = process.env.NEBULA_API_KEY; // Use the private API key

  if (!apiKey) {
    console.error("Nebula API key is not set in the environment.");
    return new Response(
      JSON.stringify({ error: "Server configuration error: API key is missing" }),
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api-nebula.symbl.ai/v1/model/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ApiKey": apiKey, // Use the header as specified by Thirdweb's documentation
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
      console.error("Error response:", response.status, errorText);
      return new Response(errorText, { status: response.status });
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error sending Nebula chat request:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
