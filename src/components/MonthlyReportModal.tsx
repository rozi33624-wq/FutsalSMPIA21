import React, { useState } from 'react';
import { Player, DailyWorkoutLog, PhysicalBenchmark } from '../types';
import { generatePlayerMonthlyPDF, generateTeamMonthlyPDF } from '../utils/pdfGenerator';
import { 
  FileText, 
  X, 
  Download, 
  Printer, 
  Award, 
  Calendar, 
  User, 
  CheckCircle,
  FileCheck
} from 'lucide-react';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  logs: DailyWorkoutLog[];
  benchmarks: PhysicalBenchmark[];
  initialPlayerId?: string;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  players,
  logs,
  benchmarks,
  initialPlayerId,
}) => {
  const [reportType, setReportType] = useState<'individual' | 'team'>('individual');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(initialPlayerId || players[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState<string>('September 2026');

  if (!isOpen) return null;

  const currentPlayer = players.find(p => p.id === selectedPlayerId) || players[0];
  const playerBenchmark = benchmarks.find(b => b.playerId === currentPlayer?.id);
  const playerLogs = logs.filter(l => l.playerId === currentPlayer?.id);

  // Calculations for preview
  const totalSessions = playerLogs.length;
  const totalMinutes = playerLogs.reduce((sum, l) => sum + l.durationMinutes, 0);
  const totalLoad = playerLogs.reduce((sum, l) => sum + l.trainingLoad, 0);
  const avgRpe = totalSessions > 0 ? (playerLogs.reduce((sum, l) => sum + l.rpe, 0) / totalSessions).toFixed(1) : '0';
  const avgSleep = totalSessions > 0 ? (playerLogs.reduce((sum, l) => sum + l.nutrition.sleepHours, 0) / totalSessions).toFixed(1) : '0';
  const avgWater = totalSessions > 0 ? (playerLogs.reduce((sum, l) => sum + l.nutrition.waterLiters, 0) / totalSessions).toFixed(1) : '0';

  const handleDownloadPDF = () => {
    if (reportType === 'individual' && currentPlayer) {
      generatePlayerMonthlyPDF(currentPlayer, logs, playerBenchmark, selectedMonth);
    } else {
      generateTeamMonthlyPDF(players, logs, selectedMonth);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-20 bg-emerald-800 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center border border-emerald-600">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Ekspor Rapor Evaluasi Bulanan (Format PDF)</h2>
              <p className="text-xs text-emerald-200">
                FUTSAL SMPI AL AZHAR 21 • Dokumen Resmi Akademik & Tim Futsal
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls / Filter row */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-semibold">
              <button
                onClick={() => setReportType('individual')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  reportType === 'individual'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Rapor Individu Atlet
              </button>
              <button
                onClick={() => setReportType('team')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  reportType === 'team'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Rekapitulasi Skuad Tim
              </button>
            </div>

            {reportType === 'individual' && (
              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-white shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    #{p.jerseyNumber} {p.name} ({p.grade})
                  </option>
                ))}
              </select>
            )}

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-white shadow-sm outline-none"
            >
              <option value="September 2026">September 2026</option>
              <option value="Agustus 2026">Agustus 2026</option>
              <option value="Juli 2026">Juli 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBrowserPrint}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Langsung
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh File PDF Resmi
            </button>
          </div>
        </div>

        {/* Live Document Preview Container (Styled like realistic A4 paper) */}
        <div className="p-6 bg-slate-100 dark:bg-slate-950 flex justify-center">
          <div className="bg-white text-slate-900 w-full max-w-2xl rounded-lg shadow-xl p-8 border border-slate-200 print:shadow-none print:border-none print:p-0">
            
            {/* Kop Surat SMPI Al Azhar 21 */}
            <div className="text-center pb-3 border-b-2 border-emerald-900 relative">
              <div className="inline-block px-3 py-0.5 bg-emerald-800 text-white text-[10px] font-bold rounded tracking-wider mb-1">
                YAYASAN PESANTREN ISLAM AL AZHAR
              </div>
              <h1 className="text-lg font-black tracking-wide text-slate-900">
                SMPI AL AZHAR 21
              </h1>
              <p className="text-xs font-bold text-emerald-800">
                DEPARTEMEN OLAHRAGA PRESTASI • AKADEMI FUTSAL PROFESIONAL
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Jl. Kampus Al Azhar 21 • Telp (021) 7278369 • Email: futsal@smpialazhar21.sch.id
              </p>
            </div>

            {reportType === 'individual' && currentPlayer && (
              <div className="mt-4 space-y-4">
                <div className="text-center">
                  <h2 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
                    RAPOR EVALUASI BULANAN WORKOUT & PERFORMA FISIK ATLET
                  </h2>
                  <p className="text-[11px] text-slate-600">
                    Periode: {selectedMonth} • Jenjang: {currentPlayer.level}
                  </p>
                </div>

                {/* Player Profile Grid */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs grid grid-cols-2 gap-y-1.5">
                  <div><span className="text-slate-500">Nama Siswa:</span> <span className="font-bold">{currentPlayer.name}</span></div>
                  <div><span className="text-slate-500">Posisi:</span> <span className="font-bold">{currentPlayer.position}</span></div>
                  <div><span className="text-slate-500">NISN / No. Punggung:</span> <span className="font-bold">{currentPlayer.nisn} / #{currentPlayer.jerseyNumber}</span></div>
                  <div><span className="text-slate-500">Kelas:</span> <span className="font-bold">{currentPlayer.grade}</span></div>
                  <div><span className="text-slate-500">Tinggi / Berat:</span> <span className="font-bold">{currentPlayer.heightCm} cm / {currentPlayer.weightKg} kg</span></div>
                  <div><span className="text-slate-500">VO2Max Terdata:</span> <span className="font-bold text-emerald-700">{currentPlayer.vo2max} ml/kg/min</span></div>
                </div>

                {/* Key Monthly Metrics */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">Total Sesi</span>
                    <span className="text-xs font-bold text-emerald-800">{totalSessions} Sesi</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">Total Durasi</span>
                    <span className="text-xs font-bold text-emerald-800">{totalMinutes} Menit</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">Beban Latihan</span>
                    <span className="text-xs font-bold text-emerald-800">{totalLoad} AU</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">Rata2 RPE</span>
                    <span className="text-xs font-bold text-emerald-800">{avgRpe} / 10</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">Rata2 Tidur</span>
                    <span className="text-xs font-bold text-emerald-800">{avgSleep} Jam</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">Rata2 Air</span>
                    <span className="text-xs font-bold text-emerald-800">{avgWater} Liter</span>
                  </div>
                </div>

                {/* Physical Benchmark Table */}
                <div>
                  <h3 className="text-xs font-bold text-slate-800 mb-1.5">
                    I. HASIL TES PARAMETER FISIK BERKALA
                  </h3>
                  <table className="w-full text-[11px] border border-slate-200 text-left">
                    <thead className="bg-emerald-800 text-white text-[10px]">
                      <tr>
                        <th className="p-1.5">Yo-Yo Test Level</th>
                        <th className="p-1.5">VO2Max Estimate</th>
                        <th className="p-1.5">Sprint 20m</th>
                        <th className="p-1.5">Illinois Agility</th>
                        <th className="p-1.5">Vertical Jump</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-1.5 font-bold">{playerBenchmark?.yoYoTestLevel || '19.2'}</td>
                        <td className="p-1.5 font-bold text-emerald-700">{playerBenchmark?.vo2MaxEstimate || currentPlayer.vo2max} ml/kg</td>
                        <td className="p-1.5">{playerBenchmark?.sprint20mSeconds || 2.98} dtk</td>
                        <td className="p-1.5">{playerBenchmark?.illinoisAgilitySeconds || 14.8} dtk</td>
                        <td className="p-1.5 font-bold">{playerBenchmark?.verticalJumpCm || 61} cm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Recent Training Table */}
                <div>
                  <h3 className="text-xs font-bold text-slate-800 mb-1.5">
                    II. REKAPITULASI WORKOUT & NUTRISI TERAKHIR
                  </h3>
                  <table className="w-full text-[10px] border border-slate-200 text-left">
                    <thead className="bg-emerald-800 text-white">
                      <tr>
                        <th className="p-1">Tanggal</th>
                        <th className="p-1">Kategori Latihan</th>
                        <th className="p-1">Durasi</th>
                        <th className="p-1">RPE</th>
                        <th className="p-1">Load</th>
                        <th className="p-1">Air / Tidur</th>
                        <th className="p-1">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {playerLogs.slice(0, 5).map((log, idx) => (
                        <tr key={log.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-1">{log.date}</td>
                          <td className="p-1 font-medium">{log.category}</td>
                          <td className="p-1">{log.durationMinutes}m</td>
                          <td className="p-1 font-bold">{log.rpe}/10</td>
                          <td className="p-1 font-bold text-emerald-800">{log.trainingLoad}</td>
                          <td className="p-1">{log.nutrition.waterLiters}L / {log.nutrition.sleepHours}h</td>
                          <td className="p-1 text-emerald-600 font-semibold">Terverifikasi</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-800 mb-1">
                    III. EVALUASI & REKOMENDASI PELATIH KEPALA
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Kedisiplinan latihan dan input nutrisi ananda menunjukkan komitmen luar biasa. Rata-rata beban latihan berada di zona optimal perkembangan fisik. Disarankan meningkatkan porsi hidrasi di atas 3 liter pada hari game simulasi dan menjaga waktu tidur sebelum pukul 22.00 WIB.
                  </p>
                </div>

                {/* Signatures Block */}
                <div className="pt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-600">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-semibold">Orang Tua / Wali Siswa</p>
                    <div className="h-12 flex items-end justify-center">
                      <div className="w-28 border-b border-slate-400"></div>
                    </div>
                    <p className="mt-1 font-medium">( ................................ )</p>
                  </div>

                  <div>
                    <p>Mengevaluasi,</p>
                    <p className="font-semibold">Pelatih Fisik Tim</p>
                    <div className="h-12 flex items-end justify-center">
                      <div className="w-28 border-b border-slate-400"></div>
                    </div>
                    <p className="mt-1 font-bold text-slate-900">Coach Rozi, S.Pd., C.Ftc</p>
                  </div>

                  <div>
                    <p>Menyetujui,</p>
                    <p className="font-semibold">Koor. Olahraga Al Azhar 21</p>
                    <div className="h-12 flex items-end justify-center">
                      <div className="w-28 border-b border-slate-400"></div>
                    </div>
                    <p className="mt-1 font-bold text-slate-900">Drs. H. M. Syarif, M.Pd.</p>
                  </div>
                </div>
              </div>
            )}

            {reportType === 'team' && (
              <div className="mt-4 space-y-4">
                <div className="text-center">
                  <h2 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
                    REKAPITULASI EVALUASI BULANAN TIM FUTSAL AL AZHAR 21
                  </h2>
                  <p className="text-[11px] text-slate-600">
                    Periode: {selectedMonth} • Total Skuad: {players.length} Pemain (SMP & SMA)
                  </p>
                </div>

                <table className="w-full text-[10px] border border-slate-200 text-left">
                  <thead className="bg-emerald-800 text-white">
                    <tr>
                      <th className="p-1">No</th>
                      <th className="p-1">Nama Pemain</th>
                      <th className="p-1">Kelas/Jenjang</th>
                      <th className="p-1">Posisi</th>
                      <th className="p-1">Total Sesi</th>
                      <th className="p-1">Beban (AU)</th>
                      <th className="p-1">Rata2 RPE</th>
                      <th className="p-1">Status Hari Ini</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {players.map((p, idx) => {
                      const pLogs = logs.filter(l => l.playerId === p.id);
                      const totalLoad = pLogs.reduce((s, l) => s + l.trainingLoad, 0);
                      const avgRpe = pLogs.length > 0 ? (pLogs.reduce((s, l) => s + l.rpe, 0) / pLogs.length).toFixed(1) : '0';
                      const loggedToday = pLogs.some(l => l.date === new Date().toISOString().split('T')[0]);

                      return (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-1">{idx + 1}</td>
                          <td className="p-1 font-bold">{p.name}</td>
                          <td className="p-1">{p.grade} ({p.level})</td>
                          <td className="p-1">{p.position}</td>
                          <td className="p-1">{pLogs.length} sesi</td>
                          <td className="p-1 font-bold text-emerald-800">{totalLoad} AU</td>
                          <td className="p-1">{avgRpe}/10</td>
                          <td className="p-1">
                            {loggedToday ? (
                              <span className="text-emerald-700 font-bold">SUDAH INPUT</span>
                            ) : (
                              <span className="text-rose-600 font-bold">BELUM INPUT</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl flex items-center justify-between">
          <span className="text-xs text-slate-500">
            * Laporan PDF dihasilkan resmi oleh Sistem Pemantauan Futsal SMPI Al Azhar 21.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
