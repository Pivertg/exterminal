import { PrismaClient } from "@prisma/client";

// Un seul client Prisma partagé dans toute l'application.
export const prisma = new PrismaClient();
