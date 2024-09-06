import { useState } from "react";
import api from "@/api/axiosConfig";
import { useAuth } from "@/hooks/useAuth";

interface WeatherData {
  id: string;
  date: string;
  type: "SUNNY" | "CLOUDY" | "RAINY" | "SNOWY";
  averageTemperature: number;
  hourlyTemperatures: { hour: number; temperature: number }[];
}

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchWeather = async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/weather/${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWeatherData(response.data);
    } catch (err) {
      setError("Ошибка при загрузке данных о погоде");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherRange = async (page: number): Promise<WeatherData[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/weather/range?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      setError("Ошибка при загрузке диапазона данных о погоде");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWeather = async (): Promise<WeatherData[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/weather/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      setError("Ошибка при загрузке всех данных о погоде");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addWeather = async (
    weatherData: Omit<WeatherData, "id">
  ): Promise<WeatherData> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/weather", weatherData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      setError("Ошибка при добавлении данных о погоде");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateWeather = async (
    weatherData: WeatherData
  ): Promise<WeatherData> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(
        `/api/weather/${weatherData.id}`,
        weatherData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (err) {
      setError("Ошибка при обновлении данных о погоде");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    weatherData,
    loading,
    error,
    fetchWeather,
    fetchWeatherRange,
    fetchAllWeather,
    addWeather,
    updateWeather,
  };
};
