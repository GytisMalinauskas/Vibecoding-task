import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const note = await prisma.note.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error(`Failed to delete note ${id}:`, error);

    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 },
    );
  }
}
