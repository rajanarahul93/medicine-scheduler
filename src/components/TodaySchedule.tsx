import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp } from "lucide-react";
import {type Medicine,type MedicineDose } from "../types/medicine";
import { getTodaysDoses } from "../utils/schedule";
import { saveDose, updateDoseStatus, getAllDoses } from "../utils/database";
import { DoseCard } from "./DoseCard";

interface TodayScheduleProps {
  medicines: Medicine[];
}

export function TodaySchedule({ medicines }: TodayScheduleProps) {
  const [doses, setDoses] = useState<MedicineDose[]>([]);

  useEffect(() => {
    const loadDoses = async () => {
      try {
        // Get today's scheduled doses
        const todaysDoses = getTodaysDoses(medicines);

        // Get saved doses from database
        const savedDoses = await getAllDoses();

        // Merge scheduled doses with saved status
        const mergedDoses = todaysDoses.map((scheduledDose) => {
          const savedDose = savedDoses.find(
            (saved) => saved.id === scheduledDose.id
          );
          return savedDose || scheduledDose;
        });

        setDoses(mergedDoses);
      } catch (error) {
        console.error("Failed to load doses:", error);
        setDoses(getTodaysDoses(medicines));
      }
    };

    if (medicines.length > 0) {
      loadDoses();
    }
  }, [medicines]);

  const handleStatusChange = async (
    doseId: string,
    newStatus: MedicineDose["status"]
  ) => {
    try {
      const takenTime =
        newStatus === "taken" ? new Date().toISOString() : undefined;

      // Update local state immediately
      setDoses((prev) =>
        prev.map((dose) =>
          dose.id === doseId ? { ...dose, status: newStatus, takenTime } : dose
        )
      );

      // Persist to database
      await updateDoseStatus(doseId, newStatus, takenTime);

      // If this is a new dose, save the full dose object
      const updatedDose = doses.find((d) => d.id === doseId);
      if (updatedDose) {
        await saveDose({ ...updatedDose, status: newStatus, takenTime });
      }
    } catch (error) {
      console.error("Failed to update dose status:", error);
      // Revert local state on error
      setDoses((prev) =>
        prev.map((dose) =>
          dose.id === doseId
            ? { ...dose, status: "pending", takenTime: undefined }
            : dose
        )
      );
    }
  };

  const takenCount = doses.filter((dose) => dose.status === "taken").length;
  const totalCount = doses.length;

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Today's Schedule
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {format(new Date(), "EEEE, MMMM do, yyyy")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {doses.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No medicines scheduled for today</p>
            <p className="text-sm">Add a medicine to see your schedule</p>
          </div>
        ) : (
          <>
            {/* Progress Summary */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border dark:border-gray-700">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Progress: {takenCount} of {totalCount} doses taken
                </p>
                <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        totalCount > 0 ? (takenCount / totalCount) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Dose Cards */}
            <div className="space-y-3">
              {doses.map((dose) => {
                const medicine = medicines.find(
                  (m) => m.id === dose.medicineId
                );
                if (!medicine || !dose.id) return null;

                return (
                  <DoseCard
                    key={dose.id}
                    dose={dose}
                    medicine={medicine}
                    onStatusChange={handleStatusChange}
                  />
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}