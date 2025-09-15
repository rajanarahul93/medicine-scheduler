import { useState, useEffect } from "react";
import { addDays, format, startOfWeek, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Medicine,type MedicineDose } from "../types/medicine";
import { generateDosesForDate } from "../utils/schedule";
import { getAllDoses } from "../utils/database";
import {  getStatusIcon } from "../utils/schedule";

interface WeeklyViewProps {
  medicines: Medicine[];
}

export function WeeklyView({ medicines }: WeeklyViewProps) {
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date()));
  const [weekDoses, setWeekDoses] = useState<{ [key: string]: MedicineDose[] }>(
    {}
  );

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  useEffect(() => {
    const loadWeekDoses = async () => {
      const savedDoses = await getAllDoses();
      const weekDosesMap: { [key: string]: MedicineDose[] } = {};

      weekDays.forEach((day) => {
        const dayKey = format(day, "yyyy-MM-dd");
        const scheduledDoses = medicines.flatMap((medicine) =>
          generateDosesForDate(medicine, day)
        );

        const mergedDoses = scheduledDoses.map((scheduled) => {
          const saved = savedDoses.find((s) => s.id === scheduled.id);
          return saved || scheduled;
        });

        weekDosesMap[dayKey] = mergedDoses;
      });

      setWeekDoses(weekDosesMap);
    };

    if (medicines.length > 0) {
      loadWeekDoses();
    }
  }, [medicines, currentWeek, weekDays]);

  const goToPreviousWeek = () => {
    setCurrentWeek((prev) => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek((prev) => addDays(prev, 7));
  };

  const getDayStats = (dayKey: string) => {
    const doses = weekDoses[dayKey] || [];
    const taken = doses.filter((d) => d.status === "taken").length;
    const total = doses.length;
    return { taken, total, percentage: total > 0 ? (taken / total) * 100 : 0 };
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Weekly Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium dark:text-gray-300">
              {format(currentWeek, "MMM d")} -{" "}
              {format(addDays(currentWeek, 6), "MMM d, yyyy")}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const doses = weekDoses[dayKey] || [];
            const stats = getDayStats(dayKey);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={dayKey}
                className={`p-3 rounded-lg border ${
                  isToday
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-600"
                }`}
              >
                <div className="text-center mb-2">
                  <div
                    className={`text-xs font-medium ${
                      isToday
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {format(day, "EEE")}
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      isToday
                        ? "text-blue-600 dark:text-blue-400"
                        : "dark:text-white"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                </div>

                {doses.length > 0 && (
                  <>
                    <div className="text-xs text-center mb-2 dark:text-gray-300">
                      {stats.taken}/{stats.total} doses
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mb-2">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                    <div className="space-y-1">
                      {doses.slice(0, 3).map((dose) => {
                        const medicine = medicines.find(
                          (m) => m.id === dose.medicineId
                        );
                        if (!medicine) return null;

                        return (
                          <div
                            key={dose.id}
                            className="text-xs p-1 rounded flex items-center gap-1"
                            style={{ backgroundColor: `${medicine.color}20` }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: medicine.color }}
                            />
                            <span className="truncate text-gray-700 dark:text-gray-300">
                              {medicine.name}
                            </span>
                            <span className="ml-auto">
                              {getStatusIcon(dose.status)}
                            </span>
                          </div>
                        );
                      })}
                      {doses.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          +{doses.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}

                {doses.length === 0 && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    No medicines
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}