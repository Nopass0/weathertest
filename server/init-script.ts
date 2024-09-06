import { PrismaClient, Role } from "@prisma/client";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function createAdmin(email: string, password: string) {
  console.log("Создание администратора...");

  // Проверяем, есть ли уже администратор
  const adminExists = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (adminExists) {
    console.log("Администратор уже существует.");
    return;
  }

  const hashedPassword = await argon2.hash(password);
  const token = jwt.sign({ email }, process.env.JWT_SECRET || "default_secret");

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: Role.ADMIN,
      token: token,
    },
  });

  console.log("Администратор успешно создан.");
}

async function main() {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error("Email и пароль обязательны.");
    process.exit(1);
  }

  try {
    console.log("Попытка подключения к базе данных...");
    await prisma.$connect();
    console.log("Успешно подключено к базе данных.");

    await createAdmin(email, password);

    console.log("Инициализация успешно завершена.");
  } catch (err) {
    console.error("Ошибка во время инициализации:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("Отключено от базы данных.");
  }
}

main().catch((e) => {
  console.error("Необработанная ошибка во время инициализации:", e);
  process.exit(1);
});
