import { Player, DailyWorkoutLog, PhysicalBenchmark, ReminderNotification } from '../types';
import { INITIAL_PLAYERS, INITIAL_LOGS, INITIAL_PHYSICAL_BENCHMARKS } from '../data/mockData';

const STORAGE_KEYS = {
  PLAYERS: 'futsal_azhar21_players',
  LOGS: 'futsal_azhar21_logs',
  BENCHMARKS: 'futsal_azhar21_benchmarks',
  REMINDERS: 'futsal_azhar21_reminders',
  ACTIVE_USER_ID: 'futsal_azhar21_active_user',
  ACTIVE_ROLE: 'futsal_azhar21_active_role',
};

export const getStoredPlayers = (): Player[] => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    if (!item) {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
      return INITIAL_PLAYERS;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error('Failed reading players from storage', e);
    return INITIAL_PLAYERS;
  }
};

export const getStoredLogs = (): DailyWorkoutLog[] => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!item) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error('Failed reading logs from storage', e);
    return INITIAL_LOGS;
  }
};

export const saveWorkoutLog = (newLog: DailyWorkoutLog): DailyWorkoutLog[] => {
  const currentLogs = getStoredLogs();
  const existingIdx = currentLogs.findIndex(l => l.id === newLog.id || (l.playerId === newLog.playerId && l.date === newLog.date));
  
  let updated: DailyWorkoutLog[];
  if (existingIdx >= 0) {
    updated = [...currentLogs];
    updated[existingIdx] = newLog;
  } else {
    updated = [newLog, ...currentLogs];
  }
  
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('futsal_data_changed'));
  return updated;
};

export const updateCoachFeedback = (logId: string, coachNotes: string): DailyWorkoutLog[] => {
  const currentLogs = getStoredLogs();
  const updated = currentLogs.map(l => l.id === logId ? { ...l, coachNotes, verifiedByCoach: true } : l);
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('futsal_data_changed'));
  return updated;
};

export const getStoredBenchmarks = (): PhysicalBenchmark[] => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.BENCHMARKS);
    if (!item) {
      localStorage.setItem(STORAGE_KEYS.BENCHMARKS, JSON.stringify(INITIAL_PHYSICAL_BENCHMARKS));
      return INITIAL_PHYSICAL_BENCHMARKS;
    }
    return JSON.parse(item);
  } catch (e) {
    return INITIAL_PHYSICAL_BENCHMARKS;
  }
};

export const getStoredReminders = (): ReminderNotification[] => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return item ? JSON.parse(item) : [];
  } catch (e) {
    return [];
  }
};

export const addReminderRecord = (reminder: ReminderNotification): ReminderNotification[] => {
  const current = getStoredReminders();
  const updated = [reminder, ...current];
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('futsal_data_changed'));
  return updated;
};

export const resetAllData = () => {
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
  localStorage.setItem(STORAGE_KEYS.BENCHMARKS, JSON.stringify(INITIAL_PHYSICAL_BENCHMARKS));
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('futsal_data_changed'));
};
