import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";

const uploadsDirectory = path.resolve(process.cwd(), "uploads");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id },
      select: {
        fileName: true,
        storedName: true,
        mimeType: true,
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 },
      );
    }

    const filePath = path.resolve(uploadsDirectory, attachment.storedName);
    const relativePath = path.relative(uploadsDirectory, filePath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      console.error(`Invalid stored filename for attachment ${id}`);

      return NextResponse.json(
        { error: "Attachment file not found" },
        { status: 404 },
      );
    }

    let file: Buffer;

    try {
      file = await readFile(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return NextResponse.json(
          { error: "Attachment file not found" },
          { status: 404 },
        );
      }

      throw error;
    }

    return new NextResponse(file, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
        "Content-Length": file.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error(`Failed to access attachment ${id}:`, error);

    return NextResponse.json(
      { error: "Failed to access attachment" },
      { status: 500 },
    );
  }
}
