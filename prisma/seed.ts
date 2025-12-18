// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  // USER
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      passwordHash: "mocked-password-hash",
    },
  });

  // TASKS
  await prisma.task.createMany({
    data: [
      {
        title: "Köpa mjölk",
        status: "open",
        priority: "low",
        authorId: user.id,
      },
      {
        title: "Plugga Prisma",
        status: "in-progress",
        priority: "high",
        authorId: user.id,
      },
    ],
  });

  // TODO LIST + TODOS
  const todoList = await prisma.todoList.create({
    data: {
      title: "Veckans todos",
    },
  });

  await prisma.todo.createMany({
    data: [
      {
        title: "Dammsuga",
        listId: todoList.id,
        done: false,
      },
      {
        title: "Tvätta",
        listId: todoList.id,
        done: true,
      },
    ],
  });

  // CHECKLIST + ITEMS
  const checklist = await prisma.checklist.create({
    data: {
      title: "Packlista",
    },
  });

  await prisma.checklistItem.createMany({
    data: [
      {
        text: "Pass",
        checklistId: checklist.id,
        done: true,
      },
      {
        text: "Laddare",
        checklistId: checklist.id,
        done: false,
      },
    ],
  });

  // NOTES
  await prisma.note.createMany({
    data: [
      {
        title: "Idéer",
        content: "Bygg kalender-vy med drag & drop.",
      },
      {
        title: "Examensarbete",
        content: "Fokusera på stabil backend först.",
      },
    ],
  });

  // ACTIVITIES (kalender)
  await prisma.activity.createMany({
    data: [
      {
        title: "Jobbmöte",
        description: "Sprint planning",
        date: new Date(),
        startTime: "09:00",
        endTime: "10:00",
        allDay: false,
      },
      {
        title: "Träning",
        date: new Date(),
        allDay: true,
      },
    ],
  });

  console.log("✅ Seed done");
}

main()
  .catch((e) => {
    console.error("❌ Seed error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
