import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const document = await prisma.document.findUnique({
    where: {
      inviteToken: params.token,
      shared: true,
    },
    include: {
      owner: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(document);
}
