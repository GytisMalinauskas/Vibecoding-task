import { NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        vehicles: true,
        notes: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            attachments: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error(`Failed to fetch customer ${id}:`, error);

    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 },
    );
  }
}