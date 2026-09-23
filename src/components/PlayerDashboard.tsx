import React, { useState } from 'react';
import { Player, DailyWorkoutLog, PhysicalBenchmark } from '../types';
import { WeeklyChart } from './WeeklyChart';
import { 
  PlusCircle, 
  FileText, 
  Flame, 
  Clock, 
  Droplet, 
  Moon, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Trophy, 
  Sparkles, 
  Calendar,
  MessageSquare,
  Award
} from 'lucide-react';

interface PlayerDashboardProps {
  player: Player;
  logs: DailyWorkoutLog[];
  benchmark?: PhysicalBenchmark;
  onOpenWorkoutModal: () => void;
  onOpenPdfModal: () => void;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  player,
  logs,
  benchmark,
  onOpenWorkoutModal,
  onOpenPdfModal,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const playerLogs = logs.filter(l => l.playerId === player.id);
  const todayLog = playerLogs.find(l => l.date === todayStr);

  const [activeTab, setActiveTab] = useState<'analytics' | 'history' | 'benchmarks'>('analytics');

  return (
    <div className="space-y-6">
      {/* Player Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={player.avatarUrl} 
              alt={player.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
            />
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow">
              #{player.jerseyNumber}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-700/80 border border-emerald-500/50 text-[11px] font-bold text-emerald-200">
                {player.level} • {player.grade}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold">
                {player.position}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1">
              {player.name}
            </h1>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              NISN: {player.nisn} • TB {player.heightCm} cm • BB {player.weightKg} kg • Target Load: {player.targetLoadPerWeek} AU/minggu
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={onOpenWorkoutModal}
            className="flex-1 md:flex-initial px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            {todayLog ? 'Edit Input Hari Ini' : 'Input Workout Hari Ini'}
          </button>
          <button
            onClick={onOpenPdfModal}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/40 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition"
          >
            <FileText className="w-4 h-4 text-emerald-300" />
            Rapor Bulanan PDF
          </button>
        </div>
      </div>

      {/* Today's Submission Status Bar */}
      {todayLog ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200 uppercase tracking-wide">
                  Data Hari Ini Terverifikasi
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  {todayLog.trainingLoad} AU Load
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                {todayLog.drillTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kategori: {todayLog.category} • Durasi: {todayLog.durationMinutes}m • Borg RPE: {todayLog.rpe}/10
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center text-xs">
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Nutrisi & Pemulihan</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                💧 {todayLog.nutrition.waterLiters}L • 🌙 {todayLog.nutrition.sleepHours}h ({todayLog.nutrition.calories} kcal)
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-dashed border-amber-300 dark:border-amber-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xs text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                Pengingat Jadwal Latihan ({todayStr})
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                Kamu belum menginput catatan workout & nutrisi hari ini!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Catat intensitas RPE latihan, asupan air minum, dan menu makananmu agar terpantau oleh Tim Pelatih.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenWorkoutModal}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Input Sekarang
          </button>
        </div>
      )}

      {/* Coach Feedback Banner (if available) */}
      {todayLog?.coachNotes && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 mt-0.5">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                Umpan Balik Tim Pelatih Fisik SMPI Al Azhar 21
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">Coach Rozi, S.Pd.</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 italic">
              "{todayLog.coachNotes}"
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'analytics'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          Visualisasi Progres Fisik Mingguan
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'history'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Riwayat Log Harian ({playerLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'benchmarks'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          Hasil Tes Fisik Futsal
        </button>
      </div>

      {/* Tab 1: Weekly Progress Visualizations */}
      {activeTab === 'analytics' && (
        <WeeklyChart player={player} logs={logs} />
      )}

      {/* Tab 2: Full Log History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Semua Catatan Latihan & Nutrisi
            </h3>
            <span className="text-xs text-slate-500">
              Total: {playerLogs.length} sesi terdata
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {playerLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {log.drillTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {log.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {log.date} • {log.durationMinutes} menit • RPE Borg {log.rpe}/10 (Load: {log.trainingLoad} AU)
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-slate-600 dark:text-slate-300">
                      <span>💧 {log.nutrition.waterLiters}L</span> • <span>🌙 {log.nutrition.sleepHours}h</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                      Terverifikasi
                    </span>
                  </div>
                </div>

                {log.playerNotes && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg italic">
                    Refleksi Atlet: "{log.playerNotes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Physical Benchmarks */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Parameter Tes Fisik Berkala Atlet Futsal
                </h3>
                <p className="text-xs text-slate-500">
                  Tanggal Tes Terakhir: {benchmark?.testDate || 'September 2026'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                Level Kebugaran: EXCELLENT
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 block">Yo-Yo IRT Test</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {benchmark?.yoYoTestLevel || '19.2'}
                </span>
                <span className="text-[11px] text-emerald-600 block mt-1">Target Nasional SMP/SMA</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 block">Estimasi VO2Max</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {benchmark?.vo2MaxEstimate || player.vo2max}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">ml/kg/min</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 block">Sprint Akselerasi 20m</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {benchmark?.sprint20mSeconds || 2.98}s
                </span>
                <span className="text-[11px] text-emerald-600 block mt-1">Sangat Cepat</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 block">Kelincahan (Illinois)</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {benchmark?.illinoisAgilitySeconds || 14.8}s
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Agility cone agility</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 block">Lompatan Vertikal</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {benchmark?.verticalJumpCm || 61} cm
                </span>
                <span className="text-[11px] text-emerald-600 block mt-1">Explosive Power</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 block">Skor Keterampilan Futsal</span>
                <span className="text-2xl font-bold text-amber-500">
                  {benchmark?.futsalSkillScore || 92} / 100
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">Teknik & Penguasaan</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
