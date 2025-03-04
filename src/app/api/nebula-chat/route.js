// app/api/nebula-chat/route.js

// Log the API key for debugging (remove this before production)
console.log("Using Nebula API key:", process.env.NEXT_PUBLIC_NEBULA_API_KEY);

export async function POST(request) {
  const { message } = await request.json();
  const apiKey = process.env.NEXT_PUBLIC_NEBULA_API_KEY; // Using NEXT_PUBLIC_NEBULA_API_KEY

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
