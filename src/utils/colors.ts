export const MEDICINE_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
] as const;

export const getRandomMedicineColor = (): string => {
  return MEDICINE_COLORS[Math.floor(Math.random() * MEDICINE_COLORS.length)];
};