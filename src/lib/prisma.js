import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

function buildUrl(url) {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}connection_limit=1&pool_timeout=10`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildUrl(process.env.DATABASE_URL),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
