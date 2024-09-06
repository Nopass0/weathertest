import { spawn, execSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const runCommand = (command, args, cwd) => {
  return new Promise<void>((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      cwd: join(__dirname, cwd),
    });

    process.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Команда завершилась с кодом ${code}`));
      } else {
        resolve();
      }
    });
  });
};

const runCommandWithEnv = (
  command: string,
  args: string[],
  envVars: Record<string, string>
) => {
  return new Promise<void>((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, ...envVars }, // Сливаем переменные окружения
      cwd: join(__dirname, "server"), // Задаем рабочую директорию
    });

    process.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Команда завершилась с кодом ${code}`));
      } else {
        resolve();
      }
    });
  });
};

// Функция для проверки существования файла .env
function checkEnvFile() {
  const envFilePath = join(__dirname, "server", ".env");

  if (!fs.existsSync(envFilePath)) {
    console.log("Файл .env не найден, создаю новый...");
    fs.writeFileSync(
      envFilePath,
      `DATABASE_URL="postgresql://postgres:root@localhost:5432/weathertest?schema=public"`
    );
  } else {
    console.log("Файл .env существует.");
  }

  const envContent = fs.readFileSync(envFilePath, "utf-8");
  if (!envContent.includes("DATABASE_URL")) {
    console.log("DATABASE_URL отсутствует, добавляю строку подключения...");
    fs.appendFileSync(
      envFilePath,
      `\nDATABASE_URL="postgresql://postgres:root@localhost:5432/weathertest?schema=public"`
    );
  }
}

// Функция для проверки и создания базы данных
async function checkAndSetupDatabase() {
  console.log("Проверка и настройка базы данных...");

  try {
    // Проверяем наличие схемы базы данных
    await runCommand("bunx", ["prisma", "db", "push"], "server");
    console.log("База данных успешно настроена.");
  } catch (error) {
    console.error("Ошибка при настройке базы данных:", error);
    process.exit(1);
  }
}

// Установка зависимостей
async function checkAndInstallDependencies() {
  console.log("Проверка и установка зависимостей...");

  // Проверка наличия Bun
  try {
    execSync("bun --version");
  } catch (error) {
    console.log("Bun не установлен. Установка Bun...");
    execSync("curl -fsSL https://bun.sh/install | bash");
  }

  // Установка зависимостей для текущего скрипта
  if (!fs.existsSync(join(__dirname, "node_modules"))) {
    console.log("Установка зависимостей для текущего скрипта...");
    execSync("bun install prompts", { stdio: "inherit" });
  }

  // Установка зависимостей для клиента
  if (!fs.existsSync(join(__dirname, "client", "node_modules"))) {
    console.log("Установка зависимостей для клиента...");
    await runCommand("bun", ["install"], "client");
  }

  // Установка зависимостей для сервера
  if (!fs.existsSync(join(__dirname, "server", "node_modules"))) {
    console.log("Установка зависимостей для сервера...");
    await runCommand("bun", ["install"], "server");
  }

  console.log("Все зависимости установлены.");
}

// Запуск разработки
async function startDevelopment() {
  try {
    console.log("Запуск клиента...");
    const client = spawn("bun", ["run", "dev"], {
      stdio: "inherit",
      shell: true,
      cwd: join(__dirname, "client"),
    });

    console.log("Запуск сервера...");
    const server = spawn("bun", ["run", "dev"], {
      stdio: "inherit",
      shell: true,
      cwd: join(__dirname, "server"),
    });

    console.log("Запуск Prisma Studio...");
    const prismaStudio = spawn("bunx", ["prisma", "studio"], {
      stdio: "inherit",
      shell: true,
      cwd: join(__dirname, "server"),
    });

    process.on("SIGINT", () => {
      console.log("Остановка клиента, сервера и Prisma Studio...");
      client.kill();
      server.kill();
      prismaStudio.kill();
      process.exit();
    });
  } catch (error) {
    console.error("Ошибка:", error.message);
    process.exit(1);
  }
}

// Инициализация тестовых данных
async function initializeTestData() {
  try {
    const email = process.argv[2] || "admin@admin.ru";
    const password = process.argv[3] || "admin";
    const envFilePath = join(__dirname, "server", ".env");

    let databaseUrl =
      "postgresql://postgres:root@localhost:5432/weathertest?schema=public";

    if (fs.existsSync(envFilePath)) {
      const envFileContent = fs.readFileSync(envFilePath, "utf8");
      const envVars = envFileContent.split("\n").reduce((acc, line) => {
        const [key, value] = line.split("=");
        if (key && value) acc[key.trim()] = value.trim();
        return acc;
      }, {} as Record<string, string>);
      databaseUrl = envVars.DATABASE_URL || databaseUrl;
    }

    console.log("Создание администратора и тестовых данных...");

    // Запуск скрипта с переменной окружения
    await runCommandWithEnv(
      "bunx",
      ["ts-node", "./init-script.ts", email, password],
      { DATABASE_URL: databaseUrl } // Передаем переменные окружения
    );

    console.log("Инициализация тестовых данных завершена.");
  } catch (error) {
    console.error("Ошибка:", error.message);
    process.exit(1);
  }
}

// Главная функция
async function main() {
  const prompts = await import("prompts");

  const { mode } = await prompts.default({
    type: "select",
    name: "mode",
    message: "Выберите режим",
    choices: [
      { title: "Инициализация тестовых данных", value: "1" },
      { title: "Режим разработки", value: "2" },
    ],
    initial: 0,
  });

  // Проверяем и создаем файл .env
  checkEnvFile();

  // Проверяем и настраиваем базу данных
  await checkAndSetupDatabase();

  if (mode === "1") {
    await initializeTestData();
  } else if (mode === "2") {
    await startDevelopment();
  } else {
    console.log("Выбран неверный режим. Выход.");
    process.exit(1);
  }
}

checkAndInstallDependencies().then(() => {
  main();
});
