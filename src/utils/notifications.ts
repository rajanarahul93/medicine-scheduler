import {type  Medicine} from "../types/medicine";

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const registerServiceWorker =
  async (): Promise<ServiceWorkerRegistration | null> => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered:", registration);
        return registration;
      } catch (error) {
        console.error("Service Worker registration failed:", error);
        return null;
      }
    }
    return null;
  };

export const scheduleNotification = (medicine: Medicine, doseTime: string) => {
  const now = new Date();
  const [hours, minutes] = doseTime.split(":").map(Number);
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);

  // If the time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delay = scheduledTime.getTime() - now.getTime();

  setTimeout(() => {
    if (Notification.permission === "granted") {
      new Notification(`Time for ${medicine.name}`, {
        body: `Take ${medicine.dosage} now`,
        icon: "/favicon.ico",
        tag: `medicine-${medicine.id}-${doseTime}`,
        requireInteraction: true,
      });
    }
  }, delay);

  console.log(`Notification scheduled for ${medicine.name} at ${doseTime}`);
};

export const scheduleAllNotifications = (medicines: Medicine[]) => {
  medicines.forEach((medicine) => {
    if (medicine.isActive) {
      medicine.times.forEach((time) => {
        scheduleNotification(medicine, time);
      });
    }
  });
};