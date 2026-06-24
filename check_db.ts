import { PrismaClient } from "@prisma/client";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const prisma = new PrismaClient();
  const count = await prisma.guideline.count();
  console.log("Guidelines in DB:", count);
  const gl = await prisma.guideline.findUnique({ where: { id: "gl_1" }});
  console.log("gl_1:", gl ? "Found" : "Not Found");
  if(gl) console.log("gl_1 content length:", gl.content?.length);
  await prisma.$disconnect();
}
main().catch(console.error);
