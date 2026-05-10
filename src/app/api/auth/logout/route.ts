import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";

// Force dynamic rendering — this route modifies cookies at request time
export const dynamic = "force-dynamic";

export async function POST() {
  await logout();
  return NextResponse.json({ success: true });
}
