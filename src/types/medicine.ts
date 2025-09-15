export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency:
    | "daily"
    | "twice-daily"
    | "three-times-daily"
    | "weekly"
    | "as-needed";
  times: string[];
  startDate: string; 
  endDate?: string;
  notes?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineDose {
  id: string;
  medicineId: string;
  scheduledTime: string; // ISO datetime string
  status: "pending" | "taken" | "missed" | "skipped";
  takenTime?: string; // ISO datetime string when marked as taken
  notes?: string;
}