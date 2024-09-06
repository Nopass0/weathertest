import type { Request, Response } from "express";
import prisma from "@/db";

export const getDailyWeather = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const weatherRecord = await prisma.weatherRecord.findUnique({
      where: { date: new Date(date) },
      include: { hourlyTemperatures: true },
    });
    if (!weatherRecord) {
      return res.status(404).json({ error: "Weather record not found" });
    }
    res.json(weatherRecord);
  } catch (error) {
    res.status(500).json({ error: "Error fetching weather data" });
  }
};

export const createOrUpdateWeather = async (req: Request, res: Response) => {
  try {
    const { date, weatherType, averageTemperature, hourlyTemperatures } =
      req.body;
    const weatherRecord = await prisma.weatherRecord.upsert({
      where: { date: new Date(date) },
      update: {
        weatherType,
        averageTemperature,
        hourlyTemperatures: {
          deleteMany: {},
          create: hourlyTemperatures,
        },
      },
      create: {
        date: new Date(date),
        weatherType,
        averageTemperature,
        hourlyTemperatures: {
          create: hourlyTemperatures,
        },
      },
      include: { hourlyTemperatures: true },
    });
    res.json(weatherRecord);
  } catch (error) {
    res.status(500).json({ error: "Error updating weather data" });
  }
};

export const getWeatherRange = async (req: Request, res: Response) => {
  try {
    const { page = "1", pageSize = "10" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
    const limit = parseInt(pageSize as string);

    const weatherRecords = await prisma.weatherRecord.findMany({
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: { hourlyTemperatures: true },
    });
    res.json(weatherRecords);
  } catch (error) {
    res.status(500).json({ error: "Error fetching weather range" });
  }
};

export const getAllWeather = async (req: Request, res: Response) => {
  try {
    const weatherRecords = await prisma.weatherRecord.findMany({
      include: { hourlyTemperatures: true },
      orderBy: { date: "desc" },
    });
    res.json(weatherRecords);
  } catch (error) {
    res.status(500).json({ error: "Error fetching all weather data" });
  }
};

export const addWeather = async (req: Request, res: Response) => {
  try {
    const { date, type, averageTemperature, hourlyTemperatures } = req.body;
    const weatherRecord = await prisma.weatherRecord.create({
      data: {
        date: new Date(date),
        weatherType: type,
        averageTemperature,
        hourlyTemperatures: {
          create: hourlyTemperatures,
        },
      },
      include: { hourlyTemperatures: true },
    });
    res.status(201).json(weatherRecord);
  } catch (error) {
    res.status(500).json({ error: "Error adding weather data" });
  }
};

export const updateWeather = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, type, averageTemperature, hourlyTemperatures } = req.body;
    const weatherRecord = await prisma.weatherRecord.update({
      where: { id },
      data: {
        date: new Date(date),
        weatherType: type,
        averageTemperature,
        hourlyTemperatures: {
          deleteMany: {},
          create: hourlyTemperatures,
        },
      },
      include: { hourlyTemperatures: true },
    });
    res.json(weatherRecord);
  } catch (error) {
    res.status(500).json({ error: "Error updating weather data" });
  }
};
