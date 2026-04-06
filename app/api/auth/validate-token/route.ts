import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  const valid = token === process.env.INVITE_TOKEN;
  return NextResponse.json({ valid });
}
