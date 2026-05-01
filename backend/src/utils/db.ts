import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// Uses DATABASE_URL from .env — works with engineType = "library" in schema.prisma
export const prisma = new PrismaClient();
