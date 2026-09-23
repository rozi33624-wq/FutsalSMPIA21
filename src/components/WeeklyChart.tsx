import React from 'react';
import { Player, DailyWorkoutLog } from '../types';
import { 
  Activity, 
  Flame, 
  Droplet, 
  Moon, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Zap,
  Award
} from 'lucide-react';

interface WeeklyChartProps {
  player: Player;
  logs: DailyWorkoutLog[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ player, logs }) => {
  // Generate past 7 days dates array
  const last7Days: { dateStr: string; dayName: string; log?: DailyWorkoutLog }[] = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = dayNames[d.getDay()];
    const log = logs.find(l => l.playerId === player.id && l.date === dateStr);
    last7Days.push({ dateStr, dayName, log });
  }

  // Calculate stats
  const totalWeekLoad = last7Days.reduce((acc, curr) => acc + (curr.log?.trainingLoad || 0), 0);
  const totalMinutes = last7Days.reduce((acc, curr) => acc + (curr.log?.durationMinutes || 0), 0);
  const activeDaysCount = last7Days.filter(d => d.log).length;
  const avgRpe = activeDaysCount > 0 
    ? (last7Days.reduce((acc, curr) => acc + (curr.log?.rpe || 0), 0) / activeDaysCount).toFixed(1)
    : '0';

  const avgWater = activeDaysCount > 0
    ? (last7Days.reduce((acc, curr) => acc + (curr.log?.nutrition.waterLiters || 0), 0) / activeDaysCount).toFixed(1)
    : '0';

  const avgSleep = activeDaysCount > 0
    ? (last7Days.reduce((acc, curr) => acc + (curr.log?.nutrition.sleepHours || 0), 0) / activeDaysCount).toFixed(1)
    : '0';

  // ACWR (Acute:Chronic Workload Ratio) estimation
  // Acute = last 7 days load. Chronic = average weekly load over past 28 days (or simulated 4 weeks target)
  const chronicWeeklyLoad = player.targetLoadPerWeek || 2400;
  const acwrRatio = Number((totalWeekLoad / chronicWeeklyLoad).toFixed(2));

  // Determine ACWR zone
  let acwrStatus: { label: string; color: string; bg: string; border: string; desc: string };
  if (acwrRatio < 0.8) {
    acwrStatus = {
      label: 'Under-training',
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800',
      desc: 'Beban latihan di bawah adaptasi optimal. Tingkatkan intensitas terukur.'
    };
  } else if (acwrRatio <= 1.3) {
    acwrStatus = {
      label: 'Optimal Zone (Sweet Spot)',
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800',
      desc: 'Adaptasi fisik prima dengan risiko cedera paling rendah.'
    };
  } else if (acwrRatio <= 1.5) {
    acwrStatus = {
      label: 'Warning / High Load',
      color: 'text-orange-700 dark:text-orange-300',
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      border: 'border-orange-200 dark:border-orange-800',
      desc: 'Beban cukup tinggi, perhatikan pemulihan, hidrasi dan tidur.'
    };
  } else {
    acwrStatus = {
      label: 'Overload / High Injury Risk',
      color: 'text-rose-700 dark:text-rose-300',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800',
      desc: 'Risiko cedera muskuloskeletal meningkat! Segera kurangi beban latihan.'
    };
  }

  const maxBarLoad = Math.max(700, ...last7Days.map(d => d.log?.trainingLoad || 0));

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Weekly Training Load</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalWeekLoad}</span>
            <span className="text-xs text-slate-500">/ {player.targetLoadPerWeek} AU</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((totalWeekLoad / player.targetLoadPerWeek) * 100))}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {Math.round((totalWeekLoad / player.targetLoadPerWeek) * 100)}% dari target mingguan
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Rata-rata RPE (1-10)</span>
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{avgRpe}</span>
            <span className="text-xs text-slate-500">/ 10 Borg</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {totalMinutes} menit total dari {activeDaysCount} sesi aktif
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Rata-rata Hidrasi</span>
            <span className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
              <Droplet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{avgWater}</span>
            <span className="text-xs text-slate-500">Liter / hari</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {Number(avgWater) >= 3.0 ? '✓ Terhidrasi Optimal' : 'Perlu +0.5L air'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Rata-rata Istirahat</span>
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              <Moon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{avgSleep}</span>
            <span className="text-xs text-slate-500">Jam / malam</span>
          </div>
          <p className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            {Number(avgSleep) >= 8 ? '✓ Recovery Sempurna' : 'Target min. 8 jam'}
          </p>
        </div>
      </div>

      {/* Main Chart Section: Daily Training Load Bar Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Beban Latihan Harian (Training Load = RPE × Menit)
            </h3>
            <p className="text-xs text-slate-500">
              Tren 7 hari terakhir atlet {player.name}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-600"></span>
              <span className="text-slate-600 dark:text-slate-400">Load Terpenuhi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700"></span>
              <span className="text-slate-600 dark:text-slate-400">Rest / Kosong</span>
            </div>
          </div>
        </div>

        {/* Bar chart container */}
        <div className="mt-6 pt-4 h-52 flex items-end justify-between gap-2 sm:gap-4 px-2">
          {last7Days.map((item, idx) => {
            const load = item.log?.trainingLoad || 0;
            const heightPercent = maxBarLoad > 0 ? (load / maxBarLoad) * 100 : 0;
            const isToday = idx === last7Days.length - 1;

            return (
              <div key={item.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip on hover */}
                {item.log ? (
                  <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 bg-slate-900 text-white text-[11px] rounded-lg py-1 px-2.5 shadow-lg whitespace-nowrap text-center">
                    <p className="font-semibold">{item.log.category}</p>
                    <p className="text-emerald-300">{item.log.durationMinutes}m | RPE {item.log.rpe} | {item.log.trainingLoad} AU</p>
                  </div>
                ) : (
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 bg-slate-800 text-slate-200 text-[10px] rounded py-1 px-2 shadow">
                    Tidak ada input
                  </div>
                )}

                {/* Number above bar */}
                <span className={`text-[10px] font-bold mb-1.5 transition-colors ${
                  load > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'
                }`}>
                  {load > 0 ? load : '-'}
                </span>

                {/* Bar */}
                <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800/80 rounded-t-lg h-36 flex items-end overflow-hidden">
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      load >= 600 
                        ? 'bg-gradient-to-t from-emerald-700 to-teal-500' 
                        : load > 0 
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                          : 'bg-transparent'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Day label */}
                <div className="mt-2 text-center">
                  <span className={`block text-xs font-semibold ${
                    isToday ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {item.dayName}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {item.dateStr.slice(8, 10)}/{item.dateStr.slice(5, 7)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Injury Risk / ACWR Gauge & Physical Spider/Attribute Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ACWR Monitoring Card */}
        <div className={`p-5 rounded-2xl border ${acwrStatus.bg} ${acwrStatus.border} transition-all`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-5 h-5 ${acwrStatus.color}`} />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Acute:Chronic Workload Ratio (ACWR)
              </h4>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border ${acwrStatus.border} ${acwrStatus.color}`}>
              {acwrStatus.label}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {acwrRatio} <span className="text-xs font-normal text-slate-500">Ratio</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {acwrStatus.desc}
              </p>
            </div>
            
            {/* Visual Gauge Bar */}
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Zona Aman Futsal</span>
              <span className="text-xs font-bold text-emerald-600">0.80 - 1.30</span>
            </div>
          </div>

          {/* ACWR Scale visual */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>0.5 (Under)</span>
              <span className="text-emerald-600 font-semibold">1.0 (Optimal)</span>
              <span>1.5 (High)</span>
              <span className="text-rose-600 font-semibold">2.0+ (Danger)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden">
              <div className="w-[30%] bg-amber-400/80" title="Under-training" />
              <div className="w-[35%] bg-emerald-500" title="Sweet Spot Optimal" />
              <div className="w-[15%] bg-orange-500" title="Warning" />
              <div className="w-[20%] bg-rose-500" title="Danger" />
            </div>
          </div>
        </div>

        {/* Physical Dimension Radar / Skills Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Matriks Performa Fisik Atlet Futsal
              </h4>
            </div>
            <span className="text-xs font-semibold text-slate-500">Benchmark Evaluasi</span>
          </div>

          <div className="space-y-2.5 mt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300 font-medium">VO2Max & Aerobic Capacity</span>
                <span className="font-bold text-slate-900 dark:text-white">{player.vo2max} ml/kg/min (88%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Speed & 20m Acceleration</span>
                <span className="font-bold text-slate-900 dark:text-white">2.98 dtk (92%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Agility & Footwork (Illinois)</span>
                <span className="font-bold text-slate-900 dark:text-white">14.8 dtk (85%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Power & Vertical Jump</span>
                <span className="font-bold text-slate-900 dark:text-white">61 cm (82%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
