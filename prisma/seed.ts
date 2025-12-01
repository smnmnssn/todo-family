// prisma/seed.ts
import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient()


async function main() {
  await prisma.category.createMany({
    data: [
      { name: "Hushåll", color: "#E67373" },
      { name: "Veckans sysslor", color: "#7DB9DE" },
      { name: "Bilen", color: "#FFD67D" }
    ]
  })
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
