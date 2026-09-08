import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

const uploadsDirectory = path.join(process.cwd(), "uploads");

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Request must use multipart/form-data" },
      { status: 400 },
    );
  }

  const noteId = formData.get("noteId");
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File);

  if (typeof noteId !== "string" || !noteId.trim() || files.length === 0) {
    return NextResponse.json(
      { error: "noteId and at least one file are required" },
      { status: 400 },
    );
  }

  const storedPaths: string[] = [];
  const attachmentIds: string[] = [];

  try {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { id: true },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 },
      );
    }

    await mkdir(uploadsDirectory, { recursive: true });

    const attachments = [];

    for (const file of files) {
      const extension = path.extname(file.name);
      const storedName = `${randomUUID()}${extension}`;
      const filePath = path.join(uploadsDirectory, storedName);

      await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
      storedPaths.push(filePath);

      const attachment = await prisma.attachment.create({
        data: {
          fileName: file.name,
          storedName,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          noteId,
        },
      });

      attachments.push(attachment);
      attachmentIds.push(attachment.id);
    }

    return NextResponse.json(attachments, { status: 201 });
  } catch (error) {
    console.error(`Failed to upload attachments for note ${noteId}:`, error);

    if (attachmentIds.length > 0) {
      try {
        await prisma.attachment.deleteMany({
          where: { id: { in: attachmentIds } },
        });
      } catch (cleanupError) {
        console.error("Failed to clean up attachment records:", cleanupError);
      }
    }

    for (const filePath of storedPaths) {
      try {
        await unlink(filePath);
      } catch (cleanupError) {
        if ((cleanupError as NodeJS.ErrnoException).code !== "ENOENT") {
          console.error(`Failed to clean up uploaded file ${filePath}:`, cleanupError);
        }
      }
    }

    return NextResponse.json(
      { error: "Failed to upload attachments" },
      { status: 500 },
    );
  }
}
