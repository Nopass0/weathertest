import express from "express";
import {
  getDailyWeather,
  createOrUpdateWeather,
  getWeatherRange,
  getAllWeather,
  addWeather,
  updateWeather,
} from "@/controllers/weatherController";
import { authMiddleware } from "@/middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware); // Применяем middleware ко всем маршрутам погоды

router.get("/daily/:date", getDailyWeather);
router.post("/update", createOrUpdateWeather);
router.get("/range", getWeatherRange);
router.get("/all", getAllWeather);
router.post("/", addWeather);
router.put("/:id", updateWeather);

export default router;
