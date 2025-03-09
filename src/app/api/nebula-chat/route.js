// app/api/nebula-chat/route.js

// For debugging purposes only—remove this log in production
console.log("Using Nebula API key:", process.env.NEBULA_API_KEY);

export async function POST(request) {
  const { message } = await request.json();
  const apiKey = process.env.NEBULA_API_KEY; // Now using the server-only variable

  if (!apiKey) {
    console.error("Nebula API key is not set in the environment.");
    return new Response(
      JSON.stringify({ error: "Server configuration error: API key is missing" }),
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://nebula-api.thirdweb.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey, // Using the key from NEBULA_API_KEY
      },
      body: JSON.stringify({ message }),
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
