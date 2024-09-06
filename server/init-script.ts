import { PrismaClient, WeatherType, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Ждем, пока база данных станет доступной
  let retries = 5;
  while (retries) {
    try {
      await prisma.$connect();
      break;
    } catch (err) {
      console.log("Failed to connect to the database. Retrying...");
      retries -= 1;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }

  if (retries === 0) {
    console.error("Failed to connect to the database after multiple attempts");
    process.exit(1);
  }

  // Проверяем наличие админа
  const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
  if (adminCount === 0) {
    const hashedPassword = await bcrypt.hash("admin", 10);
    await prisma.user.create({
      data: {
        email: "admin@admin.ru",
        password: hashedPassword,
        role: Role.ADMIN,
        token: "admin_token", // Здесь лучше генерировать случайный токен
      },
    });
    console.log("Admin user created");
  }

  // Проверяем наличие записей о погоде
  const weatherCount = await prisma.weatherRecord.count();
  if (weatherCount === 0) {
    const startDate = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const averageTemperature =
        Math.round((Math.random() * 30 - 10) * 10) / 10;
      const weatherTypes: WeatherType[] = [
        WeatherType.SUNNY,
        WeatherType.CLOUDY,
        WeatherType.RAINY,
        WeatherType.SNOWY,
      ];
      const weatherType =
        weatherTypes[Math.floor(Math.random() * weatherTypes.length)];

      await prisma.weatherRecord.create({
        data: {
          date,
          weatherType,
          averageTemperature,
          hourlyTemperatures: {
            create: Array.from({ length: 24 }, (_, hour) => ({
              hour,
              temperature: averageTemperature + (Math.random() * 5 - 2.5),
            })),
          },
        },
      });
    }
    console.log("Generated weather data for 30 days");
  }

  console.log("Initialization completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
