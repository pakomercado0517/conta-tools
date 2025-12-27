import { NextResponse } from "next/server";

export async function GET(request) {
  return NextResponse.json({
    message: "API Routes are working!",
    timestamp: new Date().toISOString(),
    url: request.url,
    method: "GET",
  });
}

export async function POST(request) {
  return NextResponse.json({
    message: "API Routes are working!",
    timestamp: new Date().toISOString(),
    url: request.url,
    method: "POST",
  });
}
