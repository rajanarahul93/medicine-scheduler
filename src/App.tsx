import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pill,
  Database,
  Bell,
  BellOff,
  Calendar,
  BarChart3,
  Plus,
  Clock,
} from "lucide-react";
import { initDB, getAllMedicines } from "./utils/database";
import {type Medicine } from "./types/medicine";
import { AddMedicineForm } from "./components/AddMedicineForm";
import { TodaySchedule } from "./components/TodaySchedule";
import { WeeklyView } from "./components/WeeklyView";
import { Analytics } from "./components/Analytics";
import { ThemeToggle } from "./components/ThemeToggle";
import { AnimatedCard } from "./components/AnimatedCard";
import { RippleButton } from "./components/RippleButton";
import { InstallPrompt } from "./components/InstallPrompt";
import {
  requestNotificationPermission,
  scheduleAllNotifications,
} from "./utils/notifications";


function App() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const setupDB = async () => {
      try {
        await initDB();
        const allMedicines = await getAllMedicines();
        setMedicines(allMedicines);
        setIsDbReady(true);
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Database initialization failed:", error);
      }
    };

    setupDB();
  }, []);

  useEffect(() => {
    setNotificationsEnabled(Notification.permission === "granted");
  }, []);

  useEffect(() => {
    if (notificationsEnabled && medicines.length > 0) {
      scheduleAllNotifications(medicines);
    }
  }, [medicines, notificationsEnabled]);

  const handleMedicineAdded = async (newMedicine: Medicine) => {
    setMedicines((prev) => [...prev, newMedicine]);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);

    if (granted) {
      scheduleAllNotifications(medicines);
      new Notification("Medicine Scheduler", {
        body: "Notifications enabled! You'll be reminded when it's time for your medicine.",
        icon: "/favicon.ico",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        {/* Header */}
        <AnimatedCard delay={0}>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="text-center relative">
              {/* Theme Toggle - Absolute positioned */}
              <div className="absolute top-4 right-4">
                <ThemeToggle />
              </div>

              {/* Centered Title */}
              <div className="flex items-center justify-center gap-2">
                <Pill className="text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-2xl dark:text-white">
                  Medicine Scheduler
                </CardTitle>
              </div>

              <CardDescription className="dark:text-gray-400">
                Never miss your medication again
              </CardDescription>
            </CardHeader>
          </Card>
        </AnimatedCard>

        {/* Notifications Setup */}
        {!notificationsEnabled && (
          <AnimatedCard delay={0.1}>
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <BellOff className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    Enable Notifications
                  </p>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                  Get reminders when it's time to take your medicine on both
                  mobile and desktop.
                </p>
                <RippleButton
                  onClick={handleEnableNotifications}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Enable Notifications
                </RippleButton>
              </CardContent>
            </Card>
          </AnimatedCard>
        )}

        {/* Main Content Tabs */}
        {isDbReady && (
          <AnimatedCard delay={0.2}>
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid w-full grid-cols-4 dark:bg-gray-800">
                <TabsTrigger value="today" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Today
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Weekly
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="add" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="today" className="space-y-4">
                  <TodaySchedule medicines={medicines} />
                </TabsContent>

                <TabsContent value="weekly" className="space-y-4">
                  <WeeklyView medicines={medicines} />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <Analytics medicines={medicines} />
                </TabsContent>

                <TabsContent value="add" className="space-y-4">
                  <AddMedicineForm onMedicineAdded={handleMedicineAdded} />
                </TabsContent>
              </div>
            </Tabs>
          </AnimatedCard>
        )}

        {/* Database Status */}
        <AnimatedCard delay={0.4}>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Database
                  className={`h-4 w-4 ${
                    isDbReady ? "text-green-600" : "text-orange-600"
                  }`}
                />
                <span
                  className={`${
                    isDbReady ? "text-green-600" : "text-orange-600"
                  } dark:text-opacity-90`}
                >
                  {isDbReady
                    ? `✓ Database Ready (${medicines.length} medicines)`
                    : "⏳ Initializing Database..."}
                </span>
              </div>
              {notificationsEnabled && (
                <div className="flex items-center justify-center gap-2 text-sm mt-2">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-600 dark:text-blue-400">
                    ✓ Notifications Enabled
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}

export default App;