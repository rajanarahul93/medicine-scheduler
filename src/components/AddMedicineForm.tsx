import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, ChevronDown } from "lucide-react";
import { addMedicine } from "../utils/database";
import { getRandomMedicineColor } from "../utils/colors";
import { type Medicine } from "../types/medicine";
import { RippleButton } from "./RippleButton";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Medicine name is required")
    .max(100, "Name too long"),
  dosage: z.string().min(1, "Dosage is required").max(50, "Dosage too long"),
  frequency: z.enum([
    "daily",
    "twice-daily",
    "three-times-daily",
    "weekly",
    "as-needed",
  ]),
  time1: z.string().min(1, "At least one time is required"),
  time2: z.string().optional(),
  time3: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddMedicineFormProps {
  onMedicineAdded: (medicine: Medicine) => void;
}

export function AddMedicineForm({ onMedicineAdded }: AddMedicineFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      frequency: "daily",
      time1: "09:00",
    },
  });

  const frequency = watch("frequency");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const times = [data.time1];
      if (
        (frequency === "twice-daily" || frequency === "three-times-daily") &&
        data.time2
      ) {
        times.push(data.time2);
      }
      if (frequency === "three-times-daily" && data.time3) {
        times.push(data.time3);
      }

      const newMedicine = await addMedicine({
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        times: times,
        startDate: new Date().toISOString().split("T")[0],
        notes: data.notes || "",
        color: getRandomMedicineColor(),
        isActive: true,
      });

      onMedicineAdded(newMedicine);
      reset();
      setIsExpanded(false);
    } catch (error) {
      console.error("Failed to add medicine:", error);
      alert("Failed to add medicine. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="text-lg flex items-center justify-between dark:text-white">
            Add New Medicine
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </CardTitle>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <motion.div
                    className="space-y-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Label htmlFor="name" className="dark:text-gray-200">
                      Medicine Name
                    </Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="e.g., Vitamin D, Aspirin"
                      className={`${
                        errors.name ? "border-red-500" : ""
                      } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Label htmlFor="dosage" className="dark:text-gray-200">
                      Dosage
                    </Label>
                    <Input
                      id="dosage"
                      {...register("dosage")}
                      placeholder="e.g., 1 tablet, 500mg"
                      className={`${
                        errors.dosage ? "border-red-500" : ""
                      } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                    />
                    {errors.dosage && (
                      <p className="text-sm text-red-500">
                        {errors.dosage.message}
                      </p>
                    )}
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="frequency" className="dark:text-gray-200">
                      Frequency
                    </Label>
                    <Select
                      value={frequency}
                      onValueChange={(value) =>
                        setValue(
                          "frequency",
                          value as FormData["frequency"]
                        )
                      }
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="twice-daily">Twice Daily</SelectItem>
                        <SelectItem value="three-times-daily">
                          Three Times Daily
                        </SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="as-needed">As Needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Label className="dark:text-gray-200">Times</Label>
                    <div className="space-y-2">
                      <Input
                        type="time"
                        {...register("time1")}
                        className={`${
                          errors.time1 ? "border-red-500" : ""
                        } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                      />
                      {errors.time1 && (
                        <p className="text-sm text-red-500">
                          {errors.time1.message}
                        </p>
                      )}

                      <AnimatePresence>
                        {(frequency === "twice-daily" ||
                          frequency === "three-times-daily") && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Input
                              type="time"
                              {...register("time2")}
                              placeholder="Second dose time"
                              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {frequency === "three-times-daily" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                          >
                            <Input
                              type="time"
                              {...register("time3")}
                              placeholder="Third dose time"
                              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Label htmlFor="notes" className="dark:text-gray-200">
                      Notes (optional)
                    </Label>
                    <Textarea
                      id="notes"
                      {...register("notes")}
                      placeholder="Additional instructions or reminders"
                      rows={2}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <RippleButton
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      {isSubmitting ? "Adding..." : "Add Medicine"}
                    </RippleButton>
                  </motion.div>
                </form>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}