import React, { useState, useEffect } from "react";
import { useWeather } from "@/hooks/useWeather";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WeatherData {
  id: string;
  date: string;
  type: "SUNNY" | "CLOUDY" | "RAINY" | "SNOWY";
  averageTemperature: number;
  hourlyTemperatures: { hour: number; temperature: number }[];
}

const Admin: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [newWeather, setNewWeather] = useState<Partial<WeatherData>>({
    date: "",
    type: "SUNNY",
    averageTemperature: 0,
    hourlyTemperatures: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      temperature: 0,
    })),
  });
  const { fetchAllWeather, addWeather, updateWeather } = useWeather();
  const { toast } = useToast();

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      const data = await fetchAllWeather();
      setWeatherData(data);
    } catch (error) {
      toast({
        title: "Ошибка загрузки данных",
        description: "Не удалось загрузить данные о погоде",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewWeather((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setNewWeather((prev) => ({ ...prev, type: value as WeatherData["type"] }));
  };

  const handleHourlyTemperatureChange = (hour: number, temperature: number) => {
    setNewWeather((prev) => ({
      ...prev,
      hourlyTemperatures: prev.hourlyTemperatures?.map((t) =>
        t.hour === hour ? { ...t, temperature } : t
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newWeather.id) {
        await updateWeather(newWeather as WeatherData);
        toast({
          title: "Данные обновлены",
          description: "Запись о погоде успешно обновлена",
        });
      } else {
        await addWeather(newWeather as Omit<WeatherData, "id">);
        toast({
          title: "Данные добавлены",
          description: "Новая запись о погоде успешно добавлена",
        });
      }
      loadWeatherData();
      setNewWeather({
        date: "",
        type: "SUNNY",
        averageTemperature: 0,
        hourlyTemperatures: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          temperature: 0,
        })),
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить данные о погоде",
        variant: "destructive",
      });
    }
  };

  return (
    <ScrollArea className="h-screen">
      <div className="container mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {newWeather.id ? "Редактировать" : "Добавить"} данные о погоде
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date">Дата</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={newWeather.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Тип погоды</Label>
                <Select
                  onValueChange={handleTypeChange}
                  value={newWeather.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип погоды" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUNNY">Солнечно</SelectItem>
                    <SelectItem value="CLOUDY">Облачно</SelectItem>
                    <SelectItem value="RAINY">Дождливо</SelectItem>
                    <SelectItem value="SNOWY">Снежно</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="averageTemperature">Средняя температура</Label>
                <Input
                  id="averageTemperature"
                  name="averageTemperature"
                  type="number"
                  value={newWeather.averageTemperature}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label>Почасовая температура</Label>
                <div className="grid grid-cols-6 gap-2">
                  {newWeather.hourlyTemperatures?.map(
                    ({ hour, temperature }) => (
                      <div key={hour}>
                        <Label htmlFor={`hour-${hour}`}>{hour}:00</Label>
                        <Input
                          id={`hour-${hour}`}
                          type="number"
                          value={temperature}
                          onChange={(e) =>
                            handleHourlyTemperatureChange(
                              hour,
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
              <Button type="submit">
                {newWeather.id ? "Обновить" : "Добавить"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Существующие данные о погоде</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Средняя температура</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weatherData.map((weather) => (
                  <TableRow key={weather.id}>
                    <TableCell>{weather.date}</TableCell>
                    <TableCell>{weather.type}</TableCell>
                    <TableCell>{weather.averageTemperature}°C</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">Подробнее</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Детали погоды на {weather.date}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-4 gap-2">
                            {weather.hourlyTemperatures.map(
                              ({ hour, temperature }) => (
                                <div key={hour}>
                                  <Label>{hour}:00</Label>
                                  <Input
                                    type="number"
                                    value={temperature}
                                    readOnly
                                  />
                                </div>
                              )
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        onClick={() => setNewWeather(weather)}
                        className="ml-2"
                      >
                        Редактировать
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default Admin;
