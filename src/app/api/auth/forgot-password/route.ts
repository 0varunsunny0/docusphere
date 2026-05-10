import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { contact } = await req.json();
    console.log(`[AUTH] Forgot password request for: ${contact}`);

    if (!contact) {
      return NextResponse.json({ error: "Contact is required" }, { status: 400 });
    }

    console.log("[AUTH] Searching for user...");
    // Find user by email or mobileNumber
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: contact },
          { mobileNumber: contact }
        ]
      }
    });
    console.log("[AUTH] User found:", !!user);

    if (!user) {
      // For security reasons, don't reveal if a user exists or not
      // but in this dev context, we'll return a generic success
      return NextResponse.json({ message: "If an account exists, an OTP has been sent." });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiry: expiry
      }
    });

    // LOG OTP to console for development
    console.log(`[AUTH] OTP for ${contact}: ${otp}`);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
