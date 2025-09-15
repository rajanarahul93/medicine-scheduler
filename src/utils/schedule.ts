import {
  format,
  parseISO,
  setHours,
  setMinutes,
} from "date-fns";
import {type  Medicine,type MedicineDose } from "../types/medicine";

export const generateDosesForDate = (
  medicine: Medicine,
  date: Date
): MedicineDose[] => {
  if (!medicine.isActive) return [];

  const startDate = parseISO(medicine.startDate);
  if (date < startDate) return [];

  if (medicine.endDate) {
    const endDate = parseISO(medicine.endDate);
    if (date > endDate) return [];
  }

  const doses: MedicineDose[] = [];

  medicine.times.forEach((timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const scheduledTime = setMinutes(setHours(date, hours), minutes);

    doses.push({
      id: `${medicine.id}-${format(scheduledTime, "yyyy-MM-dd-HH:mm")}`,
      medicineId: medicine.id,
      scheduledTime: scheduledTime.toISOString(),
      status: "pending",
    });
  });

  return doses;
};

export const getTodaysDoses = (medicines: Medicine[]): MedicineDose[] => {
  const today = new Date();
  const allDoses: MedicineDose[] = [];

  medicines.forEach((medicine) => {
    const doses = generateDosesForDate(medicine, today);
    allDoses.push(...doses);
  });

  // Sort by scheduled time
  return allDoses.sort(
    (a, b) =>
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  );
};

export const getStatusColor = (status: MedicineDose["status"]): string => {
  switch (status) {
    case "taken":
      return "bg-green-100 text-green-800 border-green-200";
    case "missed":
      return "bg-red-100 text-red-800 border-red-200";
    case "skipped":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "pending":
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
};

export const getStatusIcon = (status: MedicineDose["status"]): string => {
  switch (status) {
    case "taken":
      return "✓";
    case "missed":
      return "✗";
    case "skipped":
      return "⊘";
    case "pending":
    default:
      return "⏰";
  }
};