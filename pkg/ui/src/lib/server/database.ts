import { PrismaClient } from "../../generated/prisma/client";
import { DATABASE_URL } from "$env/static/private";

const client = new PrismaClient({
  datasourceUrl: DATABASE_URL,
});

export { client };
