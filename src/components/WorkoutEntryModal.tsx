import React, { useState } from 'react';
import { Player, DailyWorkoutLog, WorkoutCategory, NutritionLog } from '../types';
import { WORKOUT_CATEGORIES } from '../data/mockData';
import { saveWorkoutLog } from '../utils/storage';
import { 
  X, 
  Dumbbell, 
  Flame, 
  Clock, 
  Heart, 
  Utensils, 
  Droplet, 
  Moon, 
  CheckCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WorkoutEntryModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  existingLog?: DailyWorkoutLog;
  onSaved: () => void;
}

export const WorkoutEntryModal: React.FC<WorkoutEntryModalProps> = ({
  player,
  isOpen,
  onClose,
  existingLog,
  onSaved,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(existingLog?.date || todayStr);
  const [category, setCategory] = useState<WorkoutCategory>(existingLog?.category || 'Small Sided Games (SSG) / Taktikal');
  const [drillTitle, setDrillTitle] = useState<string>(existingLog?.drillTitle || '');
  const [durationMinutes, setDurationMinutes] = useState<number>(existingLog?.durationMinutes || 60);
  const [rpe, setRpe] = useState<number>(existingLog?.rpe || 7);
  const [avgHeartRate, setAvgHeartRate] = useState<number | undefined>(existingLog?.avgHeartRate || 160);
  const [maxHeartRate, setMaxHeartRate] = useState<number | undefined>(existingLog?.maxHeartRate || 180);
  const [sorenessLevel, setSorenessLevel] = useState<1 | 2 | 3 | 4 | 5>(existingLog?.sorenessLevel || 2);
  const [fatigueLevel, setFatigueLevel] = useState<1 | 2 | 3 | 4 | 5>(existingLog?.fatigueLevel || 2);

  // Nutrition state
  const [calories, setCalories] = useState<number>(existingLog?.nutrition.calories || 2600);
  const [proteinGrams, setProteinGrams] = useState<number>(existingLog?.nutrition.proteinGrams || 110);
  const [carbsGrams, setCarbsGrams] = useState<number>(existingLog?.nutrition.carbsGrams || 330);
  const [fatsGrams, setFatsGrams] = useState<number>(existingLog?.nutrition.fatsGrams || 60);
  const [waterLiters, setWaterLiters] = useState<number>(existingLog?.nutrition.waterLiters || 3.2);
  const [sleepHours, setSleepHours] = useState<number>(existingLog?.nutrition.sleepHours || 8);
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5>(existingLog?.nutrition.sleepQuality || 4);
  const [mealsSummary, setMealsSummary] = useState<string>(
    existingLog?.nutrition.mealsSummary || 'Nasi merah, dada ayam panggang, sayur bayam, pisang, telur rebus'
  );
  const [supplementNotes, setSupplementNotes] = useState<string>(
    existingLog?.nutrition.supplementNotes || 'Air kelapa muda + Multivitamin'
  );
  const [playerNotes, setPlayerNotes] = useState<string>(existingLog?.playerNotes || '');

  if (!isOpen) return null;

  const trainingLoad = durationMinutes * rpe;

  const rpeDescriptions: Record<number, { label: string; color: string; desc: string }> = {
    1: { label: 'Sangat Ringan', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'Pemulihan pasif / duduk rileks' },
    2: { label: 'Ringan Sekali', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'Jalan santai / stretching ringan' },
    3: { label: 'Ringan', color: 'bg-teal-100 text-teal-800 border-teal-300', desc: 'Jogging santai, mudah berbicara' },
    4: { label: 'Sedang Rendah', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', desc: 'Pemanasan dinamis & ball mastery santai' },
    5: { label: 'Sedang (Moderate)', color: 'bg-blue-100 text-blue-800 border-blue-300', desc: 'Mulai berkeringat, nafas teratur' },
    6: { label: 'Cukup Berat', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', desc: 'Latihan taktik / passing drill intens' },
    7: { label: 'Berat (Vigorous)', color: 'bg-amber-100 text-amber-800 border-amber-300', desc: 'Game 4v4 intensif, nafas memburu' },
    8: { label: 'Sangat Berat', color: 'bg-orange-100 text-orange-800 border-orange-300', desc: 'Interval sprint & pressing ketat' },
    9: { label: 'Hampir Maksimal', color: 'bg-rose-100 text-rose-800 border-rose-300', desc: 'Yo-Yo test / sprint all-out exhaustion' },
    10: { label: 'Maksimal Ekstrem', color: 'bg-red-200 text-red-900 border-red-400', desc: 'Usaha 100% sampai batas kemampuan' },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nutritionData: NutritionLog = {
      calories: Number(calories),
      proteinGrams: Number(proteinGrams),
      carbsGrams: Number(carbsGrams),
      fatsGrams: Number(fatsGrams),
      waterLiters: Number(waterLiters),
      sleepHours: Number(sleepHours),
      sleepQuality,
      mealsSummary,
      supplementNotes,
    };

    const newLog: DailyWorkoutLog = {
      id: existingLog?.id || `log-${player.id}-${Date.now()}`,
      playerId: player.id,
      date,
      category,
      drillTitle: drillTitle.trim() || `${category} Session`,
      durationMinutes: Number(durationMinutes),
      rpe: Number(rpe),
      trainingLoad,
      avgHeartRate: avgHeartRate ? Number(avgHeartRate) : undefined,
      maxHeartRate: maxHeartRate ? Number(maxHeartRate) : undefined,
      sorenessLevel,
      fatigueLevel,
      nutrition: nutritionData,
      playerNotes,
      coachNotes: existingLog?.coachNotes,
      verifiedByCoach: existingLog?.verifiedByCoach || false,
      createdAt: existingLog?.createdAt || new Date().toISOString(),
    };

    saveWorkoutLog(newLog);

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-emerald-800 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 flex items-center justify-center border border-emerald-600">
              <Dumbbell className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Input Workout & Nutrisi Harian</h2>
              <p className="text-xs text-emerald-200">
                {player.name} • #{player.jerseyNumber} {player.position} ({player.grade})
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Workout Core Parameters */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 border-slate-100 dark:border-slate-800">
              <Flame className="w-4 h-4 text-emerald-600" />
              1. Detail Sesi Latihan Futsal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Latihan
                </label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Utama Latihan
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as WorkoutCategory)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {WORKOUT_CATEGORIES.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fokus Menu / Drill Latihan
              </label>
              <input 
                type="text"
                placeholder="Contoh: Pressing Tinggi 3v3 + Transisi Cepat 10 detik"
                value={drillTitle}
                onChange={(e) => setDrillTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            {/* Duration and RPE Slider/Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Durasi Latihan
                  </label>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{durationMinutes} Menit</span>
                </div>
                <input 
                  type="range"
                  min="15"
                  max="150"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>15 m</span>
                  <span>60 m (Normal)</span>
                  <span>90 m</span>
                  <span>150 m</span>
                </div>
              </div>

              {/* Training Load Calculator Card */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Beban Latihan Otomatis (Training Load)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                      {trainingLoad}
                    </span>
                    <span className="text-xs text-emerald-600">AU (Arbitrary Units)</span>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
                  Formula Borg: {durationMinutes} Menit × RPE {rpe} = {trainingLoad} AU
                </p>
              </div>
            </div>

            {/* RPE Borg Scale Interactive Buttons */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Intensitas Usaha (Skala Borg CR-10 RPE)
                </label>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${rpeDescriptions[rpe].color}`}>
                  RPE {rpe}: {rpeDescriptions[rpe].label}
                </span>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRpe(val)}
                    className={`py-2 text-center rounded-lg font-bold text-xs transition-all ${
                      rpe === val
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 italic">
                "{rpeDescriptions[rpe].desc}"
              </p>
            </div>

            {/* Heart Rate & Muscle Soreness */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Detak Jantung Rata2
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    placeholder="155"
                    value={avgHeartRate || ''}
                    onChange={(e) => setAvgHeartRate(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2.5 top-1.5 text-[10px] text-slate-400">bpm</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Detak Jantung Max
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    placeholder="182"
                    value={maxHeartRate || ''}
                    onChange={(e) => setMaxHeartRate(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2.5 top-1.5 text-[10px] text-slate-400">bpm</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nyeri Otot (DOMS)
                </label>
                <select
                  value={sorenessLevel}
                  onChange={(e) => setSorenessLevel(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value={1}>1 - Sangat Segar</option>
                  <option value={2}>2 - Pegal Ringan</option>
                  <option value={3}>3 - Pegal Sedang</option>
                  <option value={4}>4 - Otot Kaku/Sakit</option>
                  <option value={5}>5 - Sangat Sakit / Nyeri</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Kelelahan Fisik
                </label>
                <select
                  value={fatigueLevel}
                  onChange={(e) => setFatigueLevel(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value={1}>1 - Sangat Berenergi</option>
                  <option value={2}>2 - Normal Fit</option>
                  <option value={3}>3 - Cukup Lelah</option>
                  <option value={4}>4 - Lelah Berat</option>
                  <option value={5}>5 - Sangat Letih</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Daily Nutrition & Recovery Tracking */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 border-slate-100 dark:border-slate-800">
              <Utensils className="w-4 h-4 text-emerald-600" />
              2. Catatan Nutrisi, Hidrasi & Istirahat Harian
            </h3>

            {/* Macros & Calories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Kalori (kcal)
                </label>
                <input 
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Protein (Gram)
                </label>
                <input 
                  type="number"
                  value={proteinGrams}
                  onChange={(e) => setProteinGrams(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Karbohidrat (Gram)
                </label>
                <input 
                  type="number"
                  value={carbsGrams}
                  onChange={(e) => setCarbsGrams(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lemak Sehat (Gram)
                </label>
                <input 
                  type="number"
                  value={fatsGrams}
                  onChange={(e) => setFatsGrams(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Hydration & Sleep */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-cyan-600" />
                  Konsumsi Air Putih (Liter)
                </label>
                <input 
                  type="number"
                  step="0.1"
                  min="1"
                  max="6"
                  value={waterLiters}
                  onChange={(e) => setWaterLiters(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  required
                />
                <span className="text-[10px] text-slate-400">Target atlet muda: min 3.0L</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  Durasi Tidur (Jam)
                </label>
                <input 
                  type="number"
                  step="0.5"
                  min="4"
                  max="12"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  required
                />
                <span className="text-[10px] text-slate-400">Target ideal atlet: 8 - 9 jam</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kualitas Tidur
                </label>
                <div className="flex gap-1 pt-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSleepQuality(star as 1 | 2 | 3 | 4 | 5)}
                      className={`text-lg transition ${
                        star <= sleepQuality ? 'text-amber-400 scale-110' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-medium text-slate-500 ml-2 self-center">
                    {sleepQuality === 5 ? 'Pulas' : sleepQuality >= 4 ? 'Nyenyak' : 'Kurang'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Menu Makanan Harian (Sarapan, Siang, Malam, Snack)
              </label>
              <textarea
                rows={2}
                value={mealsSummary}
                onChange={(e) => setMealsSummary(e.target.value)}
                placeholder="Nasi merah + dada ayam bakar, sayur brokoli, susu pisang kurma pasca latihan"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Evaluasi / Refleksi Atlet
              </label>
              <textarea
                rows={2}
                value={playerNotes}
                onChange={(e) => setPlayerNotes(e.target.value)}
                placeholder="Kondisi fisik terasa prima saat pressing, sedikit kram di betis menit 60..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
            >
              <CheckCircle className="w-4 h-4" />
              Simpan & Rekam Data Harian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
