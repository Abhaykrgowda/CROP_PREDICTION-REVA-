import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Leaf,
  Search,
  Bug,
  FlaskConical,
  Bell,
  CalendarDays,
  Loader2,
  X,
  Camera,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type Task = {
  type: string;
  title: string;
  description: string;
};

type DaySchedule = {
  date: string; // YYYY-MM-DD
  tasks: Task[];
};

type CalendarState = {
  crop: string;
  soil_type?: string;
  weather?: { temp?: number; humidity?: number; rainfall?: number };
  farm_size?: number;
  unit?: string;
  schedule?: DaySchedule[];
  source?: string;
  start_date?: string;
};

type PhotoAnalysis = {
  health_status?: string;
  confidence?: string;
  diseases?: string[];
  recommendations?: string[];
  growth_stage?: string;
  summary?: string;
};

type PhotoEntry = { url: string; filename: string; analysis?: PhotoAnalysis | null };

/* ------------------------------------------------------------------ */
/* Activity‑type config (colours + icons)                              */
/* ------------------------------------------------------------------ */
const ACTIVITY_META: Record<string, { color: string; bg: string; dot: string; Icon: typeof Droplets }> = {
  Watering:      { color: "text-blue-600",   bg: "bg-blue-100",    dot: "bg-blue-500",   Icon: Droplets },
  Fertilizing:   { color: "text-amber-600",  bg: "bg-amber-100",   dot: "bg-amber-500",  Icon: Leaf },
  Inspection:    { color: "text-emerald-600", bg: "bg-emerald-100", dot: "bg-emerald-500", Icon: Search },
  "Pest Control": { color: "text-purple-600", bg: "bg-purple-100",  dot: "bg-purple-500",  Icon: Bug },
  "Soil Testing": { color: "text-rose-600",   bg: "bg-rose-100",    dot: "bg-rose-500",    Icon: FlaskConical },
};

const activityKeys = Object.keys(ACTIVITY_META);

const getMeta = (type: string) =>
  ACTIVITY_META[type] ?? { color: "text-gray-600", bg: "bg-gray-100", dot: "bg-gray-500", Icon: CalendarDays };

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Build a map  dateStr → DaySchedule  for O(1) lookups. */
const buildScheduleMap = (schedule: DaySchedule[]) => {
  const map = new Map<string, DaySchedule>();
  schedule.forEach((d) => map.set(d.date, d));
  return map;
};

/** Is the date today (local time)? */
const isToday = (d: Date) => {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

/** Zero‑padded YYYY‑MM‑DD from a Date. */
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
const getCalendarState = (locationState: unknown): CalendarState => {
  if (locationState && typeof locationState === "object" && "schedule" in locationState) {
    return locationState as CalendarState;
  }
  try {
    const stored = sessionStorage.getItem("calendarState");
    if (stored) return JSON.parse(stored) as CalendarState;
  } catch { /* ignore */ }
  return {} as CalendarState;
};

const FarmCalendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = getCalendarState(location.state);

  const [loading, setLoading] = useState(!routeState.schedule);
  const [schedule, setSchedule] = useState<DaySchedule[]>(routeState.schedule ?? []);
  const [source, setSource] = useState(routeState.source ?? "");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [photoMap, setPhotoMap] = useState<Record<string, PhotoEntry[]>>({});
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close popover on click outside the calendar grid
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setSelectedDate(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calendar navigation — start from the schedule start_date (the day the farmer chose the crop)
  const today = new Date();
  const scheduleStart = routeState.start_date ? new Date(routeState.start_date + "T00:00:00") : today;
  const [viewYear, setViewYear] = useState(scheduleStart.getFullYear());
  const [viewMonth, setViewMonth] = useState(scheduleStart.getMonth()); // 0‑indexed

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  /* ---------- Fetch crop photos from backend ---------- */
  useEffect(() => {
    const farmerRaw = localStorage.getItem("farmer");
    const phone = farmerRaw ? JSON.parse(farmerRaw)?.phone : null;
    if (!phone) return;

    fetch(`http://127.0.0.1:5000/farmer/photos?phone=${phone}`)
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, PhotoEntry[]> = {};
        for (const p of data.photos ?? []) {
          const dateKey = p.date;
          if (!map[dateKey]) map[dateKey] = [];
          map[dateKey].push({ url: `http://127.0.0.1:5000${p.url}`, filename: p.filename, analysis: p.analysis ?? null });
        }
        setPhotoMap(map);
      })
      .catch(() => {});
  }, []);

  /* ---------- Fetch schedule from backend if not passed via state ---------- */
  useEffect(() => {
    if (schedule.length > 0) return; // already loaded
    if (!routeState.crop) {
      toast.error("No crop selected. Please go back and choose a crop.");
      return;
    }

    const fetchPlan = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:5000/cultivation-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            crop: routeState.crop,
            soil_type: routeState.soil_type,
            weather: routeState.weather,
            farm_size: routeState.farm_size,
            unit: routeState.unit,
          }),
        });
        const data = await res.json();
        if (data.schedule) {
          setSchedule(data.schedule);
          setSource(data.source ?? "backend");
        } else {
          toast.error("Failed to generate cultivation plan.");
        }
      } catch {
        toast.error("Could not reach the backend. Make sure the server is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleMap = useMemo(() => buildScheduleMap(schedule), [schedule]);

  /* ---------- Calendar grid computation ---------- */
  const firstDay = new Date(viewYear, viewMonth, 1);
  const startDow = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarCells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(new Date(viewYear, viewMonth, d));
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  /* ---------- Selected day tasks ---------- */
  const selectedDaySchedule = selectedDate ? scheduleMap.get(selectedDate) : null;

  /* ---------- Today's tasks for notification banner ---------- */
  const todayStr = toDateStr(today);
  const todaySchedule = scheduleMap.get(todayStr);

  /* ---------- Enable browser notifications ---------- */
  const enableNotifications = () => {
    if (!("Notification" in window)) {
      toast.error("Your browser does not support notifications.");
      return;
    }
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        setNotificationsEnabled(true);
        toast.success("Daily notifications enabled!");
        // Show today's tasks immediately
        if (todaySchedule) {
          const taskSummary = todaySchedule.tasks.map((t) => `• ${t.title}`).join("\n");
          new Notification(`🌾 Today's Farm Tasks — ${routeState.crop}`, {
            body: taskSummary,
            icon: "/robots.txt", // placeholder
          });
        }
      } else {
        toast.error("Notification permission denied.");
      }
    });
  };

  /* ---------- Periodic notification check (every hour) ---------- */
  useEffect(() => {
    if (!notificationsEnabled || !todaySchedule) return;
    const interval = setInterval(() => {
      const tasks = todaySchedule.tasks;
      if (tasks.length > 0) {
        new Notification(`🌾 Reminder — ${routeState.crop}`, {
          body: tasks.map((t) => `• ${t.title}`).join("\n"),
        });
      }
    }, 3600_000); // every hour
    return () => clearInterval(interval);
  }, [notificationsEnabled, todaySchedule, routeState.crop]);

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg font-semibold">Generating your farming calendar…</p>
          <p className="text-sm text-muted-foreground">AI is building a 90-day schedule for {routeState.crop}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="gradient-hero px-4 py-4">
        <div className="container mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-primary-foreground">
              🗓️ Farm Activity Calendar
            </h1>
            <p className="text-xs text-primary-foreground/70">
              Plan and track your daily farming activities
              {source === "gemini" ? " (AI‑generated)" : source === "fallback" ? " (template)" : ""}
            </p>
          </div>
          <a
            href={(() => {
              const farmer = JSON.parse(localStorage.getItem("farmer") || "{}");
              const fi = JSON.parse(localStorage.getItem("farmInput") || "{}");
              const params = new URLSearchParams({
                name: farmer.name || "",
                phone: farmer.phone || "",
                n: String(fi.N ?? 90),
                p: String(fi.P ?? 42),
                k: String(fi.K ?? 43),
                farmSize: String(fi.farmSize ?? routeState.farm_size ?? 1),
                lat: String(fi.latitude ?? ""),
                lng: String(fi.longitude ?? ""),
                from: "cropsmart",
              });
              return `http://localhost:3001/farmer-dashboard?${params.toString()}`;
            })()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-primary-foreground backdrop-blur-sm border border-white/30 transition-all hover:bg-white/30 hover:scale-105"
          >
            <Leaf className="h-3.5 w-3.5" />
            Verdant Credits
          </a>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 text-xs text-primary-foreground ${notificationsEnabled ? "opacity-60" : ""}`}
            onClick={enableNotifications}
            disabled={notificationsEnabled}
          >
            <Bell className="h-4 w-4" />
            {notificationsEnabled ? "Enabled" : "Notify Me"}
          </Button>
        </div>
      </header>

      {/* Today's tasks banner */}
      {todaySchedule && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto mt-4 px-4"
        >
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <h3 className="mb-2 text-sm font-bold text-primary">📋 Today's Tasks — {todayStr}</h3>
            <div className="flex flex-wrap gap-2">
              {todaySchedule.tasks.map((task, i) => {
                const meta = getMeta(task.type);
                return (
                  <span key={i} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${meta.bg} ${meta.color}`}>
                    <meta.Icon className="h-3 w-3" />
                    {task.title}
                  </span>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Calendar card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-6 shadow-card"
        >
          {/* Legend */}
          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs">
            {activityKeys.map((key) => {
              const meta = ACTIVITY_META[key];
              return (
                <span key={key} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                  {key}
                </span>
              );
            })}
          </div>

          {/* Month navigation */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">{routeState.crop} — Schedule</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="min-w-[160px] text-center font-bold text-primary">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Day‑of‑week header */}
          <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold text-muted-foreground">
            {DAY_LABELS.map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div ref={calendarRef} className="grid grid-cols-7 gap-px">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="min-h-[90px] rounded-lg bg-muted/30" />;
              }
              const dateStr = toDateStr(cell);
              const dayData = scheduleMap.get(dateStr);
              const isTodayCell = isToday(cell);
              const isSelected = selectedDate === dateStr;
              const hasTask = dayData && dayData.tasks.length > 0;
              const dayPhotos = photoMap[dateStr] ?? [];
              const isPast = cell < today && !isTodayCell;

              // Collect unique activity dots
              const uniqueTypes = [...new Set((dayData?.tasks ?? []).map((t) => t.type))];

              return (
                <div key={dateStr} className="relative">
                  <button
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`relative w-full min-h-[110px] rounded-lg border p-2 text-left transition-all hover:bg-primary/5
                      ${isTodayCell ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-transparent"}
                      ${isSelected ? "ring-2 ring-primary shadow-card" : ""}
                    `}
                  >
                    <span className={`text-xs font-semibold ${isTodayCell ? "text-primary" : "text-foreground/70"}`}>
                      {cell.getDate()}
                    </span>

                    {/* If photos exist for this day, show a big photo; otherwise show activity dots */}
                    {dayPhotos.length > 0 ? (
                      <div className="mt-1 flex flex-col items-center">
                        <img
                          src={dayPhotos[0].url}
                          alt="Crop"
                          className="w-full h-[70px] rounded-md object-cover border-2 border-emerald-300"
                        />
                        {dayPhotos[0].analysis?.health_status && (
                          <span className={`mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            dayPhotos[0].analysis.health_status === "Healthy" ? "bg-green-100 text-green-700" :
                            dayPhotos[0].analysis.health_status === "Mild Issue" || dayPhotos[0].analysis.health_status === "Stressed" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {dayPhotos[0].analysis.health_status}
                          </span>
                        )}
                      </div>
                    ) : hasTask ? (
                      <div className="mt-1 flex flex-col gap-1">
                        {uniqueTypes.slice(0, 3).map((type) => {
                          const meta = getMeta(type);
                          const count = dayData!.tasks.filter((t) => t.type === type).length;
                          return (
                            <span key={type} className={`block truncate rounded-md px-2 py-1 text-sm font-semibold leading-normal ${meta.bg} ${meta.color}`}>
                              {type.split(" ")[0]}{count > 1 ? ` ×${count}` : ""}
                            </span>
                          );
                        })}
                        {uniqueTypes.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{uniqueTypes.length - 3} more</span>
                        )}
                      </div>
                    ) : null}
                  </button>

                  {/* Hover card popover on click */}
                  <AnimatePresence>
                    {isSelected && (dayPhotos.length > 0 || (dayData && dayData.tasks.length > 0)) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 z-50 mt-2 w-80 -translate-x-1/2 rounded-xl border bg-card p-4 shadow-elevated"
                        style={{ top: "100%" }}
                      >
                        {/* Arrow */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-card" />
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-bold text-foreground">📅 {dateStr}</span>
                          <button onClick={() => setSelectedDate(null)} className="rounded p-1 hover:bg-muted">
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>

                        {/* If photos exist, show ONLY photos + analysis (no tasks) */}
                        {dayPhotos.length > 0 ? (
                          <div>
                            <p className="mb-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                              <Camera className="h-3 w-3" /> Crop Progress
                            </p>
                            <div className="space-y-2">
                              {dayPhotos.map((photo, pi) => (
                                <div key={pi}>
                                  <img
                                    src={photo.url}
                                    alt={`Crop ${pi + 1}`}
                                    role="button"
                                    tabIndex={0}
                                    className="w-full rounded-lg object-cover border-2 border-emerald-200 cursor-pointer hover:scale-[1.02] transition-transform focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    onClick={() => window.open(photo.url, "_blank")}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window.open(photo.url, "_blank"); } }}
                                  />
                                  {photo.analysis && (
                                    <div className="mt-2 space-y-1.5">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                          photo.analysis.health_status === "Healthy" ? "bg-green-100 text-green-700" :
                                          photo.analysis.health_status === "Mild Issue" || photo.analysis.health_status === "Stressed" ? "bg-yellow-100 text-yellow-700" :
                                          "bg-red-100 text-red-700"
                                        }`}>
                                          <Activity className="h-3 w-3" />
                                          {photo.analysis.health_status} {photo.analysis.confidence && `(${photo.analysis.confidence})`}
                                        </span>
                                        {photo.analysis.growth_stage && (
                                          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                            <Sprout className="h-3 w-3" /> {photo.analysis.growth_stage}
                                          </span>
                                        )}
                                      </div>
                                      {photo.analysis.summary && (
                                        <p className="text-[11px] text-muted-foreground leading-snug">{photo.analysis.summary}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : dayData && dayData.tasks.length > 0 ? (
                          <div className="space-y-2.5 max-h-64 overflow-y-auto">
                            {dayData.tasks.map((task, ti) => {
                              const meta = getMeta(task.type);
                              return (
                                <div key={ti} className={`flex items-start gap-3 rounded-lg p-3 ${meta.bg}/40`}>
                                  <meta.Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${meta.color}`} />
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold leading-tight">{task.title}</p>
                                    <p className="mt-1 text-xs leading-snug text-muted-foreground">{task.description}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Selected day detail panel */}
        <AnimatePresence>
          {selectedDate && (selectedDaySchedule || (photoMap[selectedDate] ?? []).length > 0) && (
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 rounded-xl border bg-card p-6 shadow-card"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  📅 {selectedDate}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setSelectedDate(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* If photos exist for this date, show ONLY big photos + analysis; otherwise show tasks */}
              {(photoMap[selectedDate] ?? []).length > 0 ? (
                <div>
                  <h4 className="mb-3 text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                    <Camera className="h-4 w-4" /> Crop Progress & AI Analysis
                  </h4>
                  <div className="space-y-6">
                    {(photoMap[selectedDate] ?? []).map((photo, pi) => (
                      <div key={pi} className="rounded-xl border border-emerald-100 overflow-hidden shadow-sm">
                        <img
                          src={photo.url}
                          alt={`Crop progress ${pi + 1}`}
                          role="button"
                          tabIndex={0}
                          className="w-full max-h-[400px] object-cover cursor-pointer hover:scale-[1.01] transition-transform focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          onClick={() => window.open(photo.url, "_blank")}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window.open(photo.url, "_blank"); } }}
                        />
                        {photo.analysis && (
                          <div className="p-4 bg-gradient-to-b from-emerald-50/50 to-white space-y-3">
                            {/* Status + Growth badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                                photo.analysis.health_status === "Healthy" ? "bg-green-100 text-green-700 ring-1 ring-green-200" :
                                photo.analysis.health_status === "Mild Issue" || photo.analysis.health_status === "Stressed" ? "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200" :
                                "bg-red-100 text-red-700 ring-1 ring-red-200"
                              }`}>
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {photo.analysis.health_status}
                                {photo.analysis.confidence && <span className="opacity-70">({photo.analysis.confidence})</span>}
                              </span>
                              {photo.analysis.growth_stage && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full ring-1 ring-blue-200">
                                  <Sprout className="h-3.5 w-3.5" /> {photo.analysis.growth_stage}
                                </span>
                              )}
                            </div>

                            {/* Summary */}
                            {photo.analysis.summary && (
                              <p className="text-sm text-foreground/80 leading-relaxed">{photo.analysis.summary}</p>
                            )}

                            {/* Diseases */}
                            {photo.analysis.diseases && photo.analysis.diseases.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-red-600 flex items-center gap-1 mb-1.5">
                                  <AlertTriangle className="h-3.5 w-3.5" /> Issues Detected
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {photo.analysis.diseases.map((d, di) => (
                                    <span key={di} className="text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                                      {d}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recommendations */}
                            {photo.analysis.recommendations && photo.analysis.recommendations.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-amber-600 flex items-center gap-1 mb-1.5">
                                  <Lightbulb className="h-3.5 w-3.5" /> Recommendations
                                </p>
                                <ul className="space-y-1">
                                  {photo.analysis.recommendations.map((r, ri) => (
                                    <li key={ri} className="text-xs text-foreground/70 flex items-start gap-1.5">
                                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                      {r}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedDaySchedule && selectedDaySchedule.tasks.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-primary">Tasks</h4>
                  {selectedDaySchedule.tasks.map((task, i) => {
                    const meta = getMeta(task.type);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-start gap-3 rounded-lg border p-4 ${meta.bg}/30`}
                      >
                        <div className={`mt-0.5 rounded-lg p-2 ${meta.bg}`}>
                          <meta.Icon className={`h-5 w-5 ${meta.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${meta.bg} ${meta.color}`}>
                              {task.type}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-semibold">{task.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{task.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick stats */}
        {schedule.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5"
          >
            {activityKeys.map((key) => {
              const meta = ACTIVITY_META[key];
              const count = schedule.reduce(
                (sum, day) => sum + day.tasks.filter((t) => t.type === key).length,
                0,
              );
              return (
                <div key={key} className="flex flex-col items-center rounded-xl border bg-card p-4 shadow-card">
                  <div className={`rounded-lg p-2 ${meta.bg}`}>
                    <meta.Icon className={`h-5 w-5 ${meta.color}`} />
                  </div>
                  <span className="mt-2 text-2xl font-extrabold">{count}</span>
                  <span className="text-xs text-muted-foreground">{key}</span>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button variant="hero" className="h-12 px-8 text-base gap-2" onClick={() => navigate("/dashboard")}>
            ➕ Add Another Land
          </Button>
          <Button variant="outline" className="h-12 px-8 text-base" onClick={() => navigate(-1)}>
            ← Back to Recommendations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FarmCalendar;
