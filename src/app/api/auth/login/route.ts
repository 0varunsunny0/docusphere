import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, createToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update streak
    const now = new Date();
    const lastVisit = new Date(user.lastVisit);
    const diffMs = now.getTime() - lastVisit.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    let newStreak = user.streak;
    if (diffDays === 1) newStreak = user.streak + 1;
    else if (diffDays > 1) newStreak = 1;

    await prisma.user.update({
      where: { id: user.id },
      data: { lastVisit: now, streak: newStreak },
    });

    const token = await createToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    cookies().set("session", token, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        streak: newStreak,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
