import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWeather } from "@/hooks/useWeather";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface WeatherData {
  id: string;
  date: Date;
  type: "SUNNY" | "CLOUDY" | "RAINY" | "SNOWY";
  averageTemperature: number;
  hourlyTemperatures: { hour: number; temperature: number }[];
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [newWeather, setNewWeather] = useState<Partial<WeatherData>>({
    date: new Date(),
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
    if (user?.role !== "ADMIN") {
      navigate("/weather");
      return;
    }
    loadWeatherData();
  }, [user]);

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

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setNewWeather((prev) => ({ ...prev, date }));
    }
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
        date: new Date(),
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

  const HourlyTemperatureChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={newWeather.hourlyTemperatures}>
        <XAxis dataKey="hour" />
        <YAxis />
        <Tooltip />
        <Bar
          dataKey="temperature"
          fill="#8884d8"
          onMouseDown={(data, index) => {
            const startY = data.y;
            const startTemp = data.temperature;

            const handleMouseMove = (e: MouseEvent) => {
              const diffY = startY - e.clientY;
              const newTemp = Math.round(startTemp + diffY / 5);
              handleHourlyTemperatureChange(data.hour, newTemp);
            };

            const handleMouseUp = () => {
              document.removeEventListener("mousemove", handleMouseMove);
              document.removeEventListener("mouseup", handleMouseUp);
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );

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
              <div className="space-y-2">
                <Label htmlFor="date">Дата</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !newWeather.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newWeather.date ? (
                        format(newWeather.date, "PPP")
                      ) : (
                        <span>Выберите дату</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newWeather.date}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                <HourlyTemperatureChart />
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
                    <TableCell>
                      {format(new Date(weather.date), "PPP")}
                    </TableCell>
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
                              Детали погоды на{" "}
                              {format(new Date(weather.date), "PPP")}
                            </DialogTitle>
                          </DialogHeader>
                          <HourlyTemperatureChart />
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
