import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { type Medicine,type MedicineDose } from "../types/medicine";
import { getStatusColor, getStatusIcon } from "../utils/schedule";
import { PillAnimation } from "./PillAnimation";
import { RippleButton } from "./RippleButton";

interface DoseCardProps {
  dose: MedicineDose;
  medicine: Medicine;
  onStatusChange: (doseId: string, newStatus: MedicineDose["status"]) => void;
}

export function DoseCard({ dose, medicine, onStatusChange }: DoseCardProps) {
  const [showPillAnimation, setShowPillAnimation] = useState(false);
  const scheduledTime = new Date(dose.scheduledTime);
  const timeStr = format(scheduledTime, "h:mm a");
  const isOverdue = new Date() > scheduledTime && dose.status === "pending";

  const handleTake = () => {
    setShowPillAnimation(true);
  };

  const handleAnimationComplete = () => {
    setShowPillAnimation(false);
    onStatusChange(dose.id, "taken");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={`transition-all duration-200 ${
            isOverdue ? "ring-2 ring-orange-200 dark:ring-orange-800" : ""
          } dark:bg-gray-800 dark:border-gray-700`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-4 h-full rounded-l-lg"
                  style={{ backgroundColor: medicine.color }}
                  animate={{
                    boxShadow:
                      dose.status === "taken"
                        ? `0 0 20px ${medicine.color}40`
                        : "none",
                  }}
                  transition={{ duration: 0.5 }}
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {medicine.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {medicine.dosage}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {timeStr}
                </p>
                {isOverdue && (
                  <motion.p
                    className="text-xs text-orange-600 dark:text-orange-400 font-medium"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Overdue
                  </motion.p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <motion.div
                animate={{ scale: dose.status === "taken" ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.5 }}
              >
                <Badge
                  className={`${getStatusColor(
                    dose.status
                  )} dark:bg-opacity-20`}
                >
                  {getStatusIcon(dose.status)}{" "}
                  {dose.status.charAt(0).toUpperCase() + dose.status.slice(1)}
                </Badge>
              </motion.div>

              {dose.status === "pending" && (
                <div className="flex gap-2">
                  <RippleButton
                    size="sm"
                    variant="outline"
                    onClick={handleTake}
                    className="h-8 px-3 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 dark:border-green-700"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Take
                  </RippleButton>
                  <RippleButton
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(dose.id, "skipped")}
                    className="h-8 px-3 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:border-gray-600"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Skip
                  </RippleButton>
                </div>
              )}

              {dose.status === "taken" && dose.takenTime && (
                <motion.p
                  className="text-xs text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Taken at {format(new Date(dose.takenTime), "h:mm a")}
                </motion.p>
              )}
            </div>

            {medicine.notes && (
              <motion.p
                className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {medicine.notes}
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <PillAnimation
        isVisible={showPillAnimation}
        onAnimationComplete={handleAnimationComplete}
      />
    </>
  );
}