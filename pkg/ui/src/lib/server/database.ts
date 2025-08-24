import { PrismaClient } from "$lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DATABASE_URL } from "$env/static/private";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const client = new PrismaClient({ adapter });

export { client };
