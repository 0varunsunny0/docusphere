import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/analytics";

// Force dynamic rendering — this route reads cookies for session auth
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { name: true, email: true } },
      collaborators: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Allow owner or collaborators
  const isOwner = document.ownerId === (session.userId as string);
  const isCollaborator = document.collaborators.some(
    (c: { userId: string }) => c.userId === (session.userId as string)
  );

  if (!isOwner && !isCollaborator && !document.shared) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await logEvent(session.userId as string, "document.open", params.id);
  return NextResponse.json(document);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Generate invite token when sharing
  if (body.shared === true) {
    const existing = await prisma.document.findUnique({
      where: { id: params.id },
      select: { inviteToken: true },
    });
    if (!existing?.inviteToken) {
      const token =
        Math.random().toString(36).substring(2, 8) +
        Math.random().toString(36).substring(2, 8);
      body.inviteToken = token;
    }
  }

  const existingDoc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!existingDoc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existingDoc.ownerId !== session.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const document = await prisma.document.update({
    where: { id: params.id },
    data: {
      ...body,
      updatedBy: session.email as string,
    },
  });

  await logEvent(session.userId as string, "document.edit", params.id);
  return NextResponse.json(document);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingDoc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!existingDoc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existingDoc.ownerId !== session.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.document.delete({
    where: { id: params.id },
  });

  await logEvent(session.userId as string, "document.delete", params.id);
  return NextResponse.json({ success: true });
}
