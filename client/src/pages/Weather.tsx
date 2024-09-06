import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Cloud, CloudRain, Snowflake } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { AreaChart, Bar, Line } from "recharts";
import { cn } from "@/lib/utils";

interface WeatherData {
  date: string;
  type: "SUNNY" | "CLOUDY" | "RAINY" | "SNOWY";
  averageTemperature: number;
  hourlyTemperatures: { hour: number; temperature: number }[];
}

const weatherIcons = {
  SUNNY: Sun,
  CLOUDY: Cloud,
  RAINY: CloudRain,
  SNOWY: Snowflake,
};

const weatherColors = {
  SUNNY: "bg-yellow-100",
  CLOUDY: "bg-gray-200",
  RAINY: "bg-blue-100",
  SNOWY: "bg-blue-50",
};

const WeatherCard: React.FC<{ data: WeatherData }> = ({ data }) => {
  const WeatherIcon = weatherIcons[data.type];

  const chartConfig = {
    temperature: {
      label: "Температура",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card className={cn("w-full h-[500px]", weatherColors[data.type])}>
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">{data.date}</h2>
            <p className="text-lg">{data.type}</p>
          </div>
          <WeatherIcon className="w-16 h-16" />
        </div>
        <p className="text-xl mb-4">
          Средняя температура: {data.averageTemperature}°C
        </p>
        <div className="flex-grow">
          <ChartContainer config={chartConfig}>
            <AreaChart data={data.hourlyTemperatures}>
              <Line
                type="monotone"
                dataKey="temperature"
                strokeWidth={2}
                activeDot={{
                  r: 8,
                  style: { fill: "var(--primary)", opacity: 0.8 },
                }}
                style={{
                  stroke: "var(--primary)",
                  opacity: 0.5,
                }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const WeatherCardSkeleton: React.FC = () => (
  <Card className="w-full h-[500px]">
    <CardContent className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-64 mb-4" />
      <Skeleton className="flex-grow w-full" />
    </CardContent>
  </Card>
);

const Weather: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchWeatherRange } = useWeather();
  const { toast } = useToast();

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMoreWeather();
    }
  }, [inView]);

  const loadMoreWeather = async () => {
    setIsLoading(true);
    try {
      const newData = await fetchWeatherRange(page);
      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setWeatherData((prevData) => [...prevData, ...newData]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      toast({
        title: "Ошибка загрузки данных",
        description: "Не удалось загрузить данные о погоде",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollArea className="h-screen">
      <div className="container mx-auto p-4 space-y-6">
        {weatherData.map((data, index) => (
          <WeatherCard key={index} data={data} />
        ))}
        {isLoading && (
          <>
            <WeatherCardSkeleton />
            <WeatherCardSkeleton />
          </>
        )}
        {hasMore && !isLoading && (
          <div
            ref={ref}
            className="w-full h-20 flex items-center justify-center"
          >
            <p>Загрузка...</p>
          </div>
        )}
        {!hasMore && !isLoading && (
          <Card className="w-full p-6 text-center">
            <p>Больше данных нет</p>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

export default Weather;
