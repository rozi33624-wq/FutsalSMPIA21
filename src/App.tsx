import React, { useState, useEffect } from 'react';
import { Player, DailyWorkoutLog, PhysicalBenchmark, UserRole } from './types';
import { 
  getStoredPlayers, 
  getStoredLogs, 
  getStoredBenchmarks, 
  resetAllData 
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { PlayerDashboard } from './components/PlayerDashboard';
import { CoachDashboard } from './components/CoachDashboard';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { WorkoutEntryModal } from './components/WorkoutEntryModal';
import { ReminderCenterModal } from './components/ReminderCenterModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { Shield, Sparkles, RefreshCw, Trophy } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<UserRole | 'database'>('player');
  const [players, setPlayers] = useState<Player[]>([]);
  const [logs, setLogs] = useState<DailyWorkoutLog[]>([]);
  const [benchmarks, setBenchmarks] = useState<PhysicalBenchmark[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('p1');

  // Modals state
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Load data function
  const loadAllData = () => {
    const loadedPlayers = getStoredPlayers();
    const loadedLogs = getStoredLogs();
    const loadedBenchmarks = getStoredBenchmarks();

    setPlayers(loadedPlayers);
    setLogs(loadedLogs);
    setBenchmarks(loadedBenchmarks);

    if (loadedPlayers.length > 0 && !selectedPlayerId) {
      setSelectedPlayerId(loadedPlayers[0].id);
    }
  };

  useEffect(() => {
    loadAllData();

    const handleStorageChange = () => {
      loadAllData();
    };

    window.addEventListener('futsal_data_changed', handleStorageChange);
    return () => {
      window.removeEventListener('futsal_data_changed', handleStorageChange);
    };
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const missingTodayCount = players.filter(
    p => !logs.some(l => l.playerId === p.id && l.date === todayStr)
  ).length;

  const currentPlayer = players.find(p => p.id === selectedPlayerId) || players[0];
  const currentBenchmark = benchmarks.find(b => b.playerId === currentPlayer?.id);

  const handleSelectPlayerFromCoach = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setRole('player');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentRole={role}
        onRoleChange={setRole}
        players={players}
        selectedPlayerId={selectedPlayerId}
        onSelectPlayer={setSelectedPlayerId}
        missingTodayCount={missingTodayCount}
        onOpenReminderModal={() => setIsReminderModalOpen(true)}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {role === 'player' && currentPlayer && (
          <PlayerDashboard
            player={currentPlayer}
            logs={logs}
            benchmark={currentBenchmark}
            onOpenWorkoutModal={() => setIsWorkoutModalOpen(true)}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        )}

        {role === 'coach' && (
          <CoachDashboard
            players={players}
            logs={logs}
            benchmarks={benchmarks}
            onOpenReminderModal={() => setIsReminderModalOpen(true)}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onSelectPlayerForDetail={handleSelectPlayerFromCoach}
          />
        )}

        {role === 'database' && (
          <DatabaseSchemaView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-300">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              FUTSAL SMPI AL AZHAR 21
            </span>
            <span>•</span>
            <span>Akademi Futsal Prestasi Siswa SMP & SMA</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm('Reset ulang data simulasi atlet dan riwayat latihan ke data awal?')) {
                  resetAllData();
                }
              }}
              className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Data Awal
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>v2.4 Production Standard</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {currentPlayer && (
        <WorkoutEntryModal
          player={currentPlayer}
          isOpen={isWorkoutModalOpen}
          onClose={() => setIsWorkoutModalOpen(false)}
          onSaved={() => loadAllData()}
        />
      )}

      <ReminderCenterModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        players={players}
        logs={logs}
        onReminderSent={() => loadAllData()}
      />

      <MonthlyReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        players={players}
        logs={logs}
        benchmarks={benchmarks}
        initialPlayerId={selectedPlayerId}
      />
    </div>
  );
}
