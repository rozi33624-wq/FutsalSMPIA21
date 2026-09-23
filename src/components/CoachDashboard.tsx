import React, { useState } from 'react';
import { Player, DailyWorkoutLog, PhysicalBenchmark, Level, Position } from '../types';
import { updateCoachFeedback } from '../utils/storage';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldAlert, 
  Bell, 
  FileText, 
  Filter, 
  ChevronRight, 
  MessageSquare, 
  Eye, 
  Flame, 
  Clock, 
  Droplet, 
  Moon, 
  Send,
  MessageCircle,
  Activity,
  Heart
} from 'lucide-react';

interface CoachDashboardProps {
  players: Player[];
  logs: DailyWorkoutLog[];
  benchmarks: PhysicalBenchmark[];
  onOpenReminderModal: () => void;
  onOpenPdfModal: () => void;
  onSelectPlayerForDetail: (playerId: string) => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({
  players,
  logs,
  benchmarks,
  onOpenReminderModal,
  onOpenPdfModal,
  onSelectPlayerForDetail,
}) => {
  const [levelFilter, setLevelFilter] = useState<'ALL' | Level>('ALL');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [selectedPlayerForFeedback, setSelectedPlayerForFeedback] = useState<Player | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter players
  const filteredPlayers = players.filter((p) => {
    if (levelFilter !== 'ALL' && p.level !== levelFilter) return false;
    if (positionFilter !== 'ALL' && !p.position.toLowerCase().includes(positionFilter.toLowerCase())) return false;
    return true;
  });

  // Calculate team metrics
  const totalPlayersCount = players.length;
  const loggedTodayPlayers = players.filter(p => logs.some(l => l.playerId === p.id && l.date === todayStr));
  const loggedTodayCount = loggedTodayPlayers.length;
  const missingTodayCount = totalPlayersCount - loggedTodayCount;
  const compliancePercent = Math.round((loggedTodayCount / totalPlayersCount) * 100);

  // Recent 7 days team logs
  const teamLogsPast7d = logs.filter(l => {
    const logDate = new Date(l.date);
    const now = new Date();
    const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7;
  });

  const avgTeamLoad = teamLogsPast7d.length > 0 
    ? Math.round(teamLogsPast7d.reduce((sum, l) => sum + l.trainingLoad, 0) / teamLogsPast7d.length)
    : 0;

  const avgTeamSleep = teamLogsPast7d.length > 0
    ? (teamLogsPast7d.reduce((sum, l) => sum + l.nutrition.sleepHours, 0) / teamLogsPast7d.length).toFixed(1)
    : '0';

  const avgTeamWater = teamLogsPast7d.length > 0
    ? (teamLogsPast7d.reduce((sum, l) => sum + l.nutrition.waterLiters, 0) / teamLogsPast7d.length).toFixed(1)
    : '0';

  // High injury risk detection (high load + high soreness >= 4)
  const highRiskPlayers = players.filter(p => {
    const pLogs = logs.filter(l => l.playerId === p.id);
    const latestLog = pLogs[0];
    return latestLog && (latestLog.sorenessLevel >= 4 || latestLog.trainingLoad > 650);
  });

  const handleOpenFeedbackModal = (player: Player) => {
    const playerLogs = logs.filter(l => l.playerId === player.id);
    const latestLog = playerLogs[0];
    setSelectedPlayerForFeedback(player);
    if (latestLog) {
      setSelectedLogId(latestLog.id);
      setFeedbackText(latestLog.coachNotes || '');
    } else {
      setSelectedLogId(null);
      setFeedbackText('');
    }
  };

  const handleSaveFeedback = () => {
    if (selectedLogId && selectedPlayerForFeedback) {
      updateCoachFeedback(selectedLogId, feedbackText);
      setSelectedPlayerForFeedback(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              Live Monitoring Room
            </span>
            <span className="text-xs text-slate-400">
              Pelatih Kepala & Trainer Fisik
            </span>
          </div>
          <h2 className="text-xl font-black">
            Dashboard Analitik Performa Skuad Futsal
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Rekap data beban latihan harian, status kepatuhan input, dan pemantauan kondisi fisik atlet SMP & SMA secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenReminderModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
          >
            <Bell className="w-4 h-4" />
            Pengingat Atlet Belum Input ({missingTodayCount})
          </button>
          <button
            onClick={onOpenPdfModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
          >
            <FileText className="w-4 h-4" />
            Ekspor Laporan PDF
          </button>
        </div>
      </div>

      {/* Real-time Team KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Compliance Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kepatuhan Input Hari Ini</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {loggedTodayCount} <span className="text-sm font-normal text-slate-400">/ {totalPlayersCount}</span>
            </span>
            <span className="text-xs font-bold text-emerald-600">({compliancePercent}%)</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {missingTodayCount > 0 ? `${missingTodayCount} pemain belum mengisi` : 'Semua telah input data'}
          </p>
        </div>

        {/* Avg Load Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Rata2 Beban Sesi Tim</span>
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{avgTeamLoad}</span>
            <span className="text-xs text-slate-400">AU / sesi</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Intensitas optimal adaptasi taktikal
          </p>
        </div>

        {/* Squad Sleep & Hydration */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Rata2 Tidur & Air Tim</span>
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              <Moon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{avgTeamSleep}h</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-2xl font-black text-cyan-600">{avgTeamWater}L</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-600 font-semibold">
            Status hidrasi & recovery terjaga
          </p>
        </div>

        {/* Injury Alert Warning */}
        <div className={`rounded-2xl p-4 border transition ${
          highRiskPlayers.length > 0 
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900' 
            : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${highRiskPlayers.length > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
              Peringatan Risiko Cedera
            </span>
            <span className={`p-1.5 rounded-lg ${highRiskPlayers.length > 0 ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'}`}>
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-3xl font-black ${highRiskPlayers.length > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {highRiskPlayers.length}
            </span>
            <span className="text-xs text-slate-500">Pemain butuh rest</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {highRiskPlayers.length > 0 
              ? `${highRiskPlayers.map(p => p.name.split(' ')[0]).join(', ')} mengalami pegal tinggi`
              : 'Seluruh skuad dalam batas aman'}
          </p>
        </div>
      </div>

      {/* Squad Monitoring Table & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Daftar Skuad & Rekapitulasi Real-Time Hari Ini
            </h3>
            <p className="text-xs text-slate-500">
              Tanggal pemantauan: {todayStr} • SMPI Al Azhar 21 Futsal Squad
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setLevelFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  levelFilter === 'ALL' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setLevelFilter('SMP')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  levelFilter === 'SMP' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Jenjang SMP
              </button>
              <button
                onClick={() => setLevelFilter('SMA')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  levelFilter === 'SMA' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Jenjang SMA
              </button>
            </div>

            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="ALL">Semua Posisi</option>
              <option value="Anchor">Anchor (Bek)</option>
              <option value="Flank">Flank (Sayap)</option>
              <option value="Pivot">Pivot (Penyerang)</option>
              <option value="Kiper">Kiper (Goalkeeper)</option>
            </select>
          </div>
        </div>

        {/* Players List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Pemain</th>
                <th className="py-3 px-3 font-semibold">Posisi & Kelas</th>
                <th className="py-3 px-3 font-semibold">Status Hari Ini</th>
                <th className="py-3 px-3 font-semibold">Drill & Beban Latihan</th>
                <th className="py-3 px-3 font-semibold">Nutrisi & Istirahat</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi Pelatih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPlayers.map((player) => {
                const todayLog = logs.find(l => l.playerId === player.id && l.date === todayStr);
                const hasLogged = !!todayLog;

                return (
                  <tr key={player.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    {/* Player Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={player.avatarUrl} 
                            alt={player.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700" 
                          />
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
                            {player.jerseyNumber}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">
                            {player.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            NISN: {player.nisn}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Position & Grade */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {player.position}
                      </span>
                      <span className="text-[11px] text-emerald-600 font-medium">
                        {player.grade} ({player.level})
                      </span>
                    </td>

                    {/* Today Status */}
                    <td className="py-3 px-3">
                      {hasLogged ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Sudah Input
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold text-[11px] border border-rose-300 dark:border-rose-800">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Belum Input
                        </span>
                      )}
                    </td>

                    {/* Workout Details */}
                    <td className="py-3 px-3">
                      {todayLog ? (
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                            {todayLog.drillTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              {todayLog.trainingLoad} AU
                            </span>
                            <span>•</span>
                            <span>{todayLog.durationMinutes}m</span>
                            <span>•</span>
                            <span className="font-medium">RPE {todayLog.rpe}/10</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          Menunggu pengisian log...
                        </span>
                      )}
                    </td>

                    {/* Nutrition & Rest */}
                    <td className="py-3 px-3">
                      {todayLog ? (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span>💧 {todayLog.nutrition.waterLiters}L Air</span>
                            <span>🌙 {todayLog.nutrition.sleepHours} Jam Tidur</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            🍗 {todayLog.nutrition.proteinGrams}g Protein • {todayLog.nutrition.calories} kcal
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">-</span>
                      )}
                    </td>

                    {/* Coach Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!hasLogged && (
                          <button
                            onClick={() => {
                              const cleanPhone = player.phone.replace(/[^0-9]/g, '');
                              const msg = `Assalamualaikum ananda ${player.name} (Futsal SMPI Al Azhar 21). Diingatkan untuk segera melengkapi data latihan harian kamu hari ini ya.`;
                              window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            title="Kirim Pengingat WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenFeedbackModal(player)}
                          title="Beri Catatan / Umpan Balik Pelatih"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center gap-1 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                          Feedback
                        </button>

                        <button
                          onClick={() => onSelectPlayerForDetail(player.id)}
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
                          title="Lihat Profil & Rapor"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Modal for Coach */}
      {selectedPlayerForFeedback && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Evaluasi & Catatan Pelatih untuk {selectedPlayerForFeedback.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Catatan ini akan langsung tampil di beranda pemain dan tercantum pada rapor evaluasi bulanan resmi.
            </p>

            <div className="mt-4">
              <textarea
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Contoh: Pertahankan intensitas sprint 15m. Fokus pada pernapasan saat transisi bertahan, jangan lupa foam roll sebelum tidur..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setSelectedPlayerForFeedback(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleSaveFeedback}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Simpan Feedback Pelatih
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
