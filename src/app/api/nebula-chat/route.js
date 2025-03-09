// app/api/nebula-chat/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { message } = await req.json();

  const secretKey = process.env.NEBULA_API_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Missing API key in server configuration" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://nebula-api.thirdweb.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": secretKey,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from Thirdweb Nebula Chat API:", response.status, errorText);
      return NextResponse.json(
        { error: `Error ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in nebula-chat route:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
