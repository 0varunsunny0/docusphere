import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { contact, otp } = await req.json();

    if (!contact || !otp) {
      return NextResponse.json({ error: "Contact and OTP are required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: contact },
          { mobileNumber: contact }
        ]
      }
    });

    if (!user || user.otpCode !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    }

    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 401 });
    }

    return NextResponse.json({ message: "OTP verified successfully" });
  } catch (error: any) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
