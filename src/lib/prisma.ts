import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  if (!url || url.includes("[PASSWORD]") || url.includes("[HOST]")) {
    console.error(
      "❌ DATABASE_URL is missing or contains placeholders. Check your .env file."
    );
    // Return unadapted client — will error on queries but won't crash startup
    return new PrismaClient();
  }

  try {
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } catch (err) {
    console.error("❌ Failed to create Prisma client:", err);
    return new PrismaClient();
  }
}

export const prisma: PrismaClient =
  globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
