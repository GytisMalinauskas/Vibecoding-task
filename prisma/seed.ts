import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.attachment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();

  await prisma.customer.create({
    data: {
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+370 600 12345",
      vehicles: {
        create: {
          registrationNumber: "ABC 123",
          make: "Toyota",
          model: "Corolla",
        },
      },
      notes: {
        create: [
          {
            text: "Customer requested a routine service appointment.",
            author: "Service team",
            category: "General",
          },
          {
            text: "Brake pads should be inspected at the next visit.",
            author: "A. Petrauskas",
            category: "Repair",
            importance: true,
            attachments: {
              create: {
                fileName: "brake-inspection.pdf",
                storedName: "brake-inspection.pdf",
                mimeType: "application/pdf",
                size: 0,
              },
            },
          },
        ],
      },
    },
  });

  await prisma.customer.create({
    data: {
      name: "Jane Miller",
      email: "jane.miller@example.com",
      vehicles: {
        create: {
          registrationNumber: "XYZ 789",
          make: "Volkswagen",
          model: "Golf",
        },
      },
      notes: {
        create: {
          text: "Payment confirmation received.",
          author: "Service team",
          category: "Payment",
        },
      },
    },
  });

  await prisma.customer.create({
    data: {
      name: "Baltic Logistics & Automotive Service Solutions",
      email: "fleet@example.com",
      phone: "+370 612 98765",
      vehicles: {
        create: [
          {
            registrationNumber: "LOG 001",
            make: "Ford",
            model: "Transit",
          },
          {
            registrationNumber: "LOG 002",
            make: "Mercedes-Benz",
            model: "Sprinter",
          },
        ],
      },
      notes: {
        create: {
          text: "Fleet maintenance schedule needs review.",
          author: "Fleet coordinator",
          category: "Complaint",
          importance: true,
        },
      },
    },
  });
}

main()
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });