import { openDB, type IDBPDatabase } from "idb";
import { type Medicine, type MedicineDose } from "../types/medicine";

const DB_NAME = "MedicineSchedulerDB";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

export const initDB = async (): Promise<IDBPDatabase> => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Medicines store
      if (!db.objectStoreNames.contains("medicines")) {
        const medicineStore = db.createObjectStore("medicines", {
          keyPath: "id",
        });
        medicineStore.createIndex("isActive", "isActive");
        medicineStore.createIndex("name", "name");
      }

      // Medicine doses store
      if (!db.objectStoreNames.contains("doses")) {
        const doseStore = db.createObjectStore("doses", { keyPath: "id" });
        doseStore.createIndex("medicineId", "medicineId");
        doseStore.createIndex("status", "status");
        doseStore.createIndex("scheduledTime", "scheduledTime");
      }
    },
  });

  return dbInstance;
};

// Medicine CRUD operations
export const addMedicine = async (
  medicine: Omit<Medicine, "id" | "createdAt" | "updatedAt">
): Promise<Medicine> => {
  const db = await initDB();
  const now = new Date().toISOString();
  const newMedicine: Medicine = {
    ...medicine,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  await db.add("medicines", newMedicine);
  return newMedicine;
};

export const getAllMedicines = async (): Promise<Medicine[]> => {
  const db = await initDB();
  const allMedicines = await db.getAll("medicines");
  return allMedicines.filter((medicine) => medicine.isActive);
};

export const updateMedicine = async (
  id: string,
  updates: Partial<Medicine>
): Promise<void> => {
  const db = await initDB();
  const medicine = await db.get("medicines", id);
  if (medicine) {
    const updatedMedicine = {
      ...medicine,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await db.put("medicines", updatedMedicine);
  }
};

export const deleteMedicine = async (id: string): Promise<void> => {
  const db = await initDB();
  await updateMedicine(id, { isActive: false });
};

// Dose CRUD operations - NEW
export const saveDose = async (dose: MedicineDose): Promise<void> => {
  const db = await initDB();
  await db.put("doses", dose);
};

export const getDose = async (
  doseId: string
): Promise<MedicineDose | undefined> => {
  const db = await initDB();
  return await db.get("doses", doseId);
};

export const getAllDoses = async (): Promise<MedicineDose[]> => {
  const db = await initDB();
  return await db.getAll("doses");
};

export const updateDoseStatus = async (
  doseId: string,
  status: MedicineDose["status"],
  takenTime?: string
): Promise<void> => {
  const db = await initDB();
  const dose = await db.get("doses", doseId);
  if (dose) {
    dose.status = status;
    if (takenTime) dose.takenTime = takenTime;
    await db.put("doses", dose);
  }
};