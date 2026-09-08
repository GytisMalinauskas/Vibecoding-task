import { NextResponse } from "next/server";

import { prisma } from "../../../lib/prisma";

const categories = new Set(["General", "Repair", "Payment", "Complaint"]);

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body must be an object" }, {
      status: 400,
    });
  }

  const { customerId, text, author, category, importance } = body as Record<
    string,
    unknown
  >;

  if (
    typeof customerId !== "string" ||
    !customerId.trim() ||
    typeof text !== "string" ||
    !text.trim() ||
    typeof author !== "string" ||
    !author.trim() ||
    typeof category !== "string" ||
    !category.trim()
  ) {
    return NextResponse.json(
      {
        error: "customerId, text, author and category are required",
      },
      { status: 400 },
    );
  }

  if (text.length > 500) {
    return NextResponse.json(
      { error: "Text must not exceed 500 characters" },
      { status: 400 },
    );
  }

  if (!categories.has(category)) {
    return NextResponse.json(
      {
        error: "Category must be General, Repair, Payment or Complaint",
      },
      { status: 400 },
    );
  }

  if (importance !== undefined && typeof importance !== "boolean") {
    return NextResponse.json(
      { error: "Importance must be a boolean" },
      { status: 400 },
    );
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    const note = await prisma.note.create({
      data: {
        customerId,
        text,
        author,
        category,
        importance: importance ?? false,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Failed to create note:", error);

    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 },
    );
  }
}
