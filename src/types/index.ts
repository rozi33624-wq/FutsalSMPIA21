export type Level = 'SMP' | 'SMA';
export type Position = 'Anchor' | 'Flank Kiri' | 'Flank Kanan' | 'Pivot' | 'Kiper (Goalkeeper)';
export type WorkoutCategory = 
  | 'VO2Max & Endurance'
  | 'Agility & Footwork'
  | 'Speed & Acceleration'
  | 'Ball Mastery & Dribbling'
  | 'Small Sided Games (SSG) / Taktikal'
  | 'Strength & Core Conditioning'
  | 'Shooting & Finishing'
  | 'Active Recovery';

export type UserRole = 'coach' | 'player';

export interface Player {
  id: string;
  name: string;
  nisn: string;
  grade: string; // e.g., 'SMP 8A' or 'SMA 10 IPA 1'
  level: Level;
  jerseyNumber: number;
  position: Position;
  avatarUrl: string;
  phone: string;
  parentPhone: string;
  heightCm: number;
  weightKg: number;
  vo2max: number; // e.g. 52.4 ml/kg/min
  targetLoadPerWeek: number; // in arbitrary units (e.g. 2000-2800)
}

export interface NutritionLog {
  calories: number; // kcal
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  waterLiters: number; // e.g. 3.2 L
  sleepHours: number; // e.g. 7.5 hrs
  sleepQuality: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  mealsSummary: string;
  supplementNotes?: string;
}

export interface DailyWorkoutLog {
  id: string;
  playerId: string;
  date: string; // YYYY-MM-DD
  category: WorkoutCategory;
  drillTitle: string;
  durationMinutes: number;
  rpe: number; // Rate of Perceived Exertion: 1 to 10
  trainingLoad: number; // durationMinutes * rpe (Borg CR-10 Training Load)
  avgHeartRate?: number;
  maxHeartRate?: number;
  sorenessLevel: 1 | 2 | 3 | 4 | 5; // 1 = Segar, 5 = Sangat Nyeri / Pegal
  fatigueLevel: 1 | 2 | 3 | 4 | 5;
  nutrition: NutritionLog;
  playerNotes: string;
  coachNotes?: string;
  verifiedByCoach: boolean;
  createdAt: string;
}

export interface PhysicalBenchmark {
  id: string;
  playerId: string;
  testDate: string; // YYYY-MM-DD
  yoYoTestLevel: string; // e.g. "18.4"
  vo2MaxEstimate: number; // e.g. 54.2
  sprint20mSeconds: number; // e.g. 3.02s
  illinoisAgilitySeconds: number; // e.g. 15.2s
  verticalJumpCm: number; // e.g. 58cm
  plankMinutes: number; // e.g. 3.5 min
  futsalSkillScore: number; // 1-100
}

export interface ReminderNotification {
  id: string;
  playerId: string;
  playerName: string;
  playerPhone: string;
  date: string;
  status: 'pending' | 'sent';
  sentAt?: string;
  channel: 'in_app' | 'whatsapp';
  message: string;
}

export interface TeamSummaryStats {
  totalPlayers: number;
  loggedTodayCount: number;
  missingTodayCount: number;
  avgWeeklyLoad: number;
  avgSleepHours: number;
  avgHydration: number;
  highInjuryRiskCount: number;
}
