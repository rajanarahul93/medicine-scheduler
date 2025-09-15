import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target,  Award } from "lucide-react";
import { type Medicine} from "../types/medicine";
import { getAllDoses } from "../utils/database";
import { subDays, format, isAfter } from "date-fns";

interface AnalyticsProps {
  medicines: Medicine[];
}

interface Stats {
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  adherenceRate: number;
  streak: number;
  bestMedicine: string;
  worstMedicine: string;
}

export function Analytics({ medicines }: AnalyticsProps) {
  const [stats, setStats] = useState<Stats>({
    totalDoses: 0,
    takenDoses: 0,
    missedDoses: 0,
    adherenceRate: 0,
    streak: 0,
    bestMedicine: "",
    worstMedicine: "",
  });

  useEffect(() => {
    const calculateStats = async () => {
      const allDoses = await getAllDoses();
      const last30Days = subDays(new Date(), 30);

      // Filter doses from last 30 days
      const recentDoses = allDoses.filter((dose) => {
        const doseDate = new Date(dose.scheduledTime);
        return isAfter(doseDate, last30Days);
      });

      const takenDoses = recentDoses.filter((d) => d.status === "taken").length;
      const missedDoses = recentDoses.filter(
        (d) => d.status === "missed"
      ).length;
      const totalDoses = recentDoses.length;
      const adherenceRate =
        totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;

      // Calculate current streak
      let streak = 0;
      let currentDate = new Date();

      while (streak < 30) {
        // Max 30 days check
        const dayDoses = allDoses.filter((dose) => {
          const doseDate = new Date(dose.scheduledTime);
          return (
            format(doseDate, "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd")
          );
        });

        if (dayDoses.length === 0) {
          currentDate = subDays(currentDate, 1);
          continue;
        }

        const allTaken = dayDoses.every((dose) => dose.status === "taken");
        if (!allTaken) break;

        streak++;
        currentDate = subDays(currentDate, 1);
      }

      // Find best and worst medicines
      const medicineStats = medicines
        .map((medicine) => {
          const medicineDoses = recentDoses.filter(
            (d) => d.medicineId === medicine.id
          );
          const medicineTaken = medicineDoses.filter(
            (d) => d.status === "taken"
          ).length;
          const adherence =
            medicineDoses.length > 0
              ? (medicineTaken / medicineDoses.length) * 100
              : 0;

          return {
            name: medicine.name,
            adherence,
            total: medicineDoses.length,
          };
        })
        .filter((stat) => stat.total > 0);

      const bestMedicine =
        medicineStats.length > 0
          ? medicineStats.reduce((prev, curr) =>
              prev.adherence > curr.adherence ? prev : curr
            ).name
          : "None";

      const worstMedicine =
        medicineStats.length > 0
          ? medicineStats.reduce((prev, curr) =>
              prev.adherence < curr.adherence ? prev : curr
            ).name
          : "None";

      setStats({
        totalDoses,
        takenDoses,
        missedDoses,
        adherenceRate,
        streak,
        bestMedicine,
        worstMedicine: medicineStats.length > 1 ? worstMedicine : "None",
      });
    };

    if (medicines.length > 0) {
      calculateStats();
    }
  }, [medicines]);

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Analytics (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Adherence Rate
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.adherenceRate.toFixed(1)}%
            </div>
            <div className="text-xs text-green-700 dark:text-green-300">
              {stats.takenDoses}/{stats.totalDoses} doses taken
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Current Streak
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.streak}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">
              {stats.streak === 1 ? "day" : "days"} perfect
            </div>
          </div>
        </div>

        {/* Dose Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Dose Summary
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Taken
              </span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                {stats.takenDoses}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Missed
              </span>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                {stats.missedDoses}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Skipped
              </span>
              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {stats.totalDoses - stats.takenDoses - stats.missedDoses}
              </Badge>
            </div>
          </div>
        </div>

        {/* Best/Worst Performers */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Medicine Performance
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Best Adherence
              </span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                {stats.bestMedicine}
              </Badge>
            </div>
            {stats.worstMedicine !== "None" &&
              stats.worstMedicine !== stats.bestMedicine && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Needs Attention
                  </span>
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200">
                    {stats.worstMedicine}
                  </Badge>
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}