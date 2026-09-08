import { unlink } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";

const uploadsDirectory = path.join(process.cwd(), "uploads");

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const note = await prisma.note.findUnique({
      where: { id },
      select: {
        id: true,
        attachments: {
          select: { storedName: true },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({
      where: { id },
    });

    for (const attachment of note.attachments) {
      try {
        await unlink(path.join(uploadsDirectory, attachment.storedName));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          console.error(
            `Failed to remove attachment file ${attachment.storedName}:`,
            error,
          );
        }
      }
    }

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
