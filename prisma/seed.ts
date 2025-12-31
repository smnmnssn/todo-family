// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Skapa två test-användare för att kunna verifiera att data inte läcker mellan konton
  const passwordHashA = await bcrypt.hash("test123", 10);
  const passwordHashB = await bcrypt.hash("test123", 10);

  const userA = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User A",
      passwordHash: passwordHashA,
    },
    select: { id: true, email: true },
  });

  const userB = await prisma.user.upsert({
    where: { email: "test2@example.com" },
    update: {},
    create: {
      email: "test2@example.com",
      name: "Test User B",
      passwordHash: passwordHashB,
    },
    select: { id: true, email: true },
  });

  // TODO LIST + TODOS (User A)
  const todoListA = await prisma.todoList.create({
    data: {
      title: "Veckans todos",
      ownerId: userA.id,
    },
    select: { id: true },
  });

  await prisma.todo.createMany({
    data: [
      { title: "Dammsuga", listId: todoListA.id, done: false },
      { title: "Tvätta", listId: todoListA.id, done: true },
    ],
  });

  // TODO LIST + TODOS (User B)
  const todoListB = await prisma.todoList.create({
    data: {
      title: "Mina privata todos",
      ownerId: userB.id,
    },
    select: { id: true },
  });

  await prisma.todo.createMany({
    data: [
      { title: "Handla", listId: todoListB.id, done: false },
      { title: "Städa garaget", listId: todoListB.id, done: false },
    ],
  });

  // CHECKLIST + ITEMS (User A)
  const checklistA = await prisma.checklist.create({
    data: {
      title: "Packlista",
      ownerId: userA.id,
    },
    select: { id: true },
  });

  await prisma.checklistItem.createMany({
    data: [
      { text: "Pass", checklistId: checklistA.id, done: true },
      { text: "Laddare", checklistId: checklistA.id, done: false },
    ],
  });

  // CHECKLIST + ITEMS (User B)
  const checklistB = await prisma.checklist.create({
    data: {
      title: "Inköpslista",
      ownerId: userB.id,
    },
    select: { id: true },
  });

  await prisma.checklistItem.createMany({
    data: [
      { text: "Kaffe", checklistId: checklistB.id, done: false },
      { text: "Bröd", checklistId: checklistB.id, done: false },
    ],
  });

  // NOTES (User A + User B)
  await prisma.note.createMany({
    data: [
      {
        title: "Idéer",
        content: "Bygg kalender-vy med drag & drop.",
        ownerId: userA.id,
      },
      {
        title: "Examensarbete",
        content: "Fokusera på stabil backend först.",
        ownerId: userA.id,
      },
      {
        title: "Privat",
        content: "Detta ska bara synas för user B.",
        ownerId: userB.id,
      },
    ],
  });

  // ACTIVITIES (kalender) (User A + User B)
  const today = new Date();

  await prisma.activity.createMany({
    data: [
      {
        title: "Jobbmöte",
        description: "Sprint planning",
        date: today,
        startTime: "09:00",
        endTime: "10:00",
        allDay: false,
        ownerId: userA.id,
      },
      {
        title: "Träning",
        date: today,
        allDay: true,
        ownerId: userA.id,
      },
      {
        title: "User B - möte",
        description: "Ska bara synas för B",
        date: today,
        startTime: "13:00",
        endTime: "13:30",
        allDay: false,
        ownerId: userB.id,
      },
    ],
  });

  console.log("✅ Seed done");
  console.log("User A:", userA.email);
  console.log("User B:", userB.email);
  console.log("Password (båda): test123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
