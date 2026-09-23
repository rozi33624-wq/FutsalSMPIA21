import React, { useState } from 'react';
import { DATABASE_SCHEMA_DOCUMENTATION } from '../data/mockData';
import { 
  Database, 
  Table, 
  Key, 
  Copy, 
  Check, 
  ArrowRight, 
  Terminal, 
  Code2, 
  Layers, 
  BookOpen,
  Share2
} from 'lucide-react';

export const DatabaseSchemaView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'erd' | 'sql' | 'nosql' | 'queries'>('erd');
  const [copiedCode, setCopiedCode] = useState(false);

  const fullSqlSchema = `-- ==========================================================
-- SKEMA DATABASE: FUTSAL SMPI AL AZHAR 21
-- RDBMS Target: PostgreSQL 15+ / Cloud SQL / Supabase
-- Modul: Workout Tracking, Nutrisi, Fisik & Reminder Otomatis
-- ==========================================================

-- Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL DATA ATLET / PEMAIN
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nisn VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    grade VARCHAR(50) NOT NULL, -- Contoh: 'SMP 9 Al-Hasan', 'SMA 10 IPA 1'
    level VARCHAR(10) NOT NULL CHECK (level IN ('SMP', 'SMA')),
    jersey_number INT NOT NULL,
    position VARCHAR(40) NOT NULL, -- 'Anchor', 'Flank Kanan', 'Flank Kiri', 'Pivot', 'Kiper'
    phone VARCHAR(25) NOT NULL,
    parent_phone VARCHAR(25),
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    vo2max NUMERIC(5,2) DEFAULT 50.0,
    target_load_per_week INT DEFAULT 2400, -- Satuan AU (Borg Load Target)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index performa pencarian pemain
CREATE INDEX idx_players_level ON players(level);
CREATE INDEX idx_players_position ON players(position);

-- 2. TABEL LOG WORKOUT HARIAN (DAILY WORKOUT LOGS)
CREATE TABLE daily_workout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    category VARCHAR(80) NOT NULL, -- 'VO2Max', 'Agility', 'SSG Taktikal', dll.
    drill_title VARCHAR(200) NOT NULL,
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    rpe INT NOT NULL CHECK (rpe BETWEEN 1 AND 10), -- Skala Borg CR-10
    
    -- Training Load otomatis dihitung (Durasi x RPE)
    training_load INT GENERATED ALWAYS AS (duration_minutes * rpe) STORED,
    
    avg_heart_rate INT,
    max_heart_rate INT,
    soreness_level INT CHECK (soreness_level BETWEEN 1 AND 5), -- 1 Segar - 5 Sangat Nyeri
    fatigue_level INT CHECK (fatigue_level BETWEEN 1 AND 5),  -- 1 Segar - 5 Kelelahan Berat
    player_notes TEXT,
    coach_notes TEXT,
    verified_by_coach BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: 1 input utama per atlet per tanggal
    CONSTRAINT uq_player_daily_log UNIQUE (player_id, log_date)
);

CREATE INDEX idx_workout_date ON daily_workout_logs(log_date);
CREATE INDEX idx_workout_player_date ON daily_workout_logs(player_id, log_date);

-- 3. TABEL NUTRISI & RECOVERY HARIAN (DAILY NUTRITION LOGS)
CREATE TABLE daily_nutrition_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_log_id UUID UNIQUE REFERENCES daily_workout_logs(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    calories INT NOT NULL DEFAULT 2400,
    protein_grams NUMERIC(6,2) NOT NULL DEFAULT 100.0,
    carbs_grams NUMERIC(6,2) NOT NULL DEFAULT 320.0,
    fats_grams NUMERIC(6,2) NOT NULL DEFAULT 60.0,
    water_liters NUMERIC(4,2) NOT NULL DEFAULT 3.0, -- Hidrasi harian atlet
    sleep_hours NUMERIC(4,2) NOT NULL DEFAULT 8.0,  -- Durasi istirahat malam
    sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 5),
    meals_summary TEXT,
    supplement_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL HASIL TES FISIK BERKALA (PHYSICAL BENCHMARKS)
CREATE TABLE physical_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    test_date DATE NOT NULL,
    yoyo_test_level VARCHAR(20) NOT NULL, -- Contoh '19.4'
    vo2max_estimate NUMERIC(5,2) NOT NULL,
    sprint_20m_sec NUMERIC(4,2) NOT NULL, -- Akselerasi sprint 20 meter
    illinois_agility_sec NUMERIC(4,2) NOT NULL,
    vertical_jump_cm NUMERIC(5,2) NOT NULL,
    plank_minutes NUMERIC(4,2),
    futsal_skill_score INT CHECK (futsal_skill_score BETWEEN 1 AND 100),
    evaluated_by VARCHAR(100) DEFAULT 'Head Coach Fisik Al Azhar 21',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL AUDIT PENGINGAT / REMINDER LOGS
CREATE TABLE reminder_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    target_date DATE NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('whatsapp', 'in_app', 'sms')),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    sent_at TIMESTAMPTZ DEFAULT NOW()
);`;

  const nosqlSchema = `{
  "futsal_smpi_alazhar21_firestore": {
    "collections": {
      "players": {
        "doc_id": "p1, p2, ...",
        "fields": {
          "name": "Muhammad Farhan Al-Fatih",
          "nisn": "0089234112",
          "grade": "SMP 9 Al-Hasan",
          "level": "SMP",
          "jerseyNumber": 10,
          "position": "Flank Kanan",
          "phone": "6281234567890",
          "parentPhone": "6281298765432",
          "heightCm": 168,
          "weightKg": 58,
          "vo2max": 54.5,
          "targetLoadPerWeek": 2400
        },
        "subcollections": {
          "daily_logs": {
            "doc_id": "2026-09-22",
            "fields": {
              "category": "Small Sided Games (SSG) / Taktikal",
              "drillTitle": "Pressing Tinggi 3v3 + Transisi Cepat",
              "durationMinutes": 75,
              "rpe": 8,
              "trainingLoad": 600,
              "avgHeartRate": 168,
              "sorenessLevel": 2,
              "nutrition": {
                "calories": 2650,
                "proteinGrams": 110,
                "waterLiters": 3.5,
                "sleepHours": 8.0,
                "sleepQuality": 5,
                "mealsSummary": "Oatmeal pisang, nasi merah dada ayam panggang"
              },
              "verifiedByCoach": true
            }
          },
          "benchmarks": {
            "doc_id": "bm_2026_09",
            "fields": {
              "testDate": "2026-09-17",
              "yoYoTestLevel": "19.2",
              "vo2MaxEstimate": 54.5,
              "sprint20mSeconds": 2.98,
              "verticalJumpCm": 61
            }
          }
        }
      },
      "reminder_logs": {
        "doc_id": "rem_12345",
        "fields": {
          "playerId": "p4",
          "date": "2026-09-22",
          "channel": "whatsapp",
          "status": "sent",
          "sentAt": "2026-09-22T20:15:00Z"
        }
      }
    }
  }
}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600 text-emerald-200 text-xs font-semibold mb-2">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            Arsitektur Skema Database Futsal Al Azhar 21
          </div>
          <h2 className="text-xl font-black">
            Database Schema & Entity Relationship Architecture
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Struktur basis data relasional & NoSQL terverifikasi untuk tracking workout harian, pemantauan nutrisi makro/mikro, metrik fisik Borg RPE, dan sistem notifikasi pengingat real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(fullSqlSchema)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition"
          >
            {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedCode ? 'Tersalin!' : 'Salin Skema DDL SQL'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('erd')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'erd'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          Diagram Relasi (ERD Visual)
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'sql'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Code2 className="w-4 h-4" />
          SQL Schema (PostgreSQL / DDL)
        </button>
        <button
          onClick={() => setActiveTab('nosql')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'nosql'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Struktur NoSQL / Firestore
        </button>
        <button
          onClick={() => setActiveTab('queries')}
          className={`pb-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'queries'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Query Analitik Pelatih (ACWR & Kepatuhan)
        </button>
      </div>

      {/* ERD Visual Diagram */}
      {activeTab === 'erd' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DATABASE_SCHEMA_DOCUMENTATION.tables.map((tbl) => (
              <div 
                key={tbl.name}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col"
              >
                <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                      {tbl.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {tbl.columns.length} Kolom
                  </span>
                </div>

                <div className="p-3 text-[11px] text-slate-500 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40">
                  {tbl.description}
                </div>

                <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto max-h-64">
                  {tbl.columns.map((col) => {
                    const isPk = col.type.includes('PRIMARY KEY');
                    const isFk = col.type.includes('REFERENCES');

                    return (
                      <div key={col.name} className="py-1.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          {isPk ? (
                            <Key className="w-3.5 h-3.5 text-amber-500" />
                          ) : isFk ? (
                            <ArrowRight className="w-3 h-3 text-blue-500" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          )}
                          <span className={`font-mono text-[11px] ${
                            isPk ? 'font-bold text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {col.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {col.type.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Visual Entity Connections explanation */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-600" />
              Relasi & Relational Integrity Antar Entitas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-emerald-600 block">players → daily_workout_logs</span>
                <span className="text-slate-500 text-[11px]">1 to Many (1:N) dengan CASCADE delete</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-emerald-600 block">workout_logs → nutrition_logs</span>
                <span className="text-slate-500 text-[11px]">1 to 1 (1:1) per hari latihan</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-emerald-600 block">players → physical_benchmarks</span>
                <span className="text-slate-500 text-[11px]">1 to Many (1:N) rekaman tes berkala</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-emerald-600 block">players → reminder_logs</span>
                <span className="text-slate-500 text-[11px]">1 to Many (1:N) audit pengingat harian</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SQL Tab */}
      {activeTab === 'sql' && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-4">
          <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
            <span>PostgreSQL DDL Migration Script</span>
            <button
              onClick={() => copyToClipboard(fullSqlSchema)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] flex items-center gap-1.5 transition"
            >
              <Copy className="w-3 h-3" /> Salin SQL
            </button>
          </div>
          <pre className="text-emerald-400 font-mono text-xs overflow-x-auto p-2 leading-relaxed">
            {fullSqlSchema}
          </pre>
        </div>
      )}

      {/* NoSQL Tab */}
      {activeTab === 'nosql' && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-4">
          <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
            <span>Google Cloud Firestore / Document NoSQL Schema</span>
            <button
              onClick={() => copyToClipboard(nosqlSchema)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] flex items-center gap-1.5 transition"
            >
              <Copy className="w-3 h-3" /> Salin JSON
            </button>
          </div>
          <pre className="text-cyan-300 font-mono text-xs overflow-x-auto p-2 leading-relaxed">
            {nosqlSchema}
          </pre>
        </div>
      )}

      {/* Analytical Queries Tab */}
      {activeTab === 'queries' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              1. Query Pemain yang Belum Input Hari Ini (Untuk Sistem Pengingat)
            </h4>
            <pre className="bg-slate-950 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-x-auto">
{`SELECT p.id, p.name, p.jersey_number, p.position, p.grade, p.phone
FROM players p
LEFT JOIN daily_workout_logs dwl 
    ON p.id = dwl.player_id AND dwl.log_date = CURRENT_DATE
WHERE dwl.id IS NULL AND p.is_active = TRUE
ORDER BY p.level, p.name;`}
            </pre>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              2. Query Perhitungan ACWR (Acute:Chronic Workload Ratio) Pencegahan Cedera
            </h4>
            <pre className="bg-slate-950 text-cyan-400 p-3 rounded-xl font-mono text-xs overflow-x-auto">
{`WITH acute_load AS (
    SELECT player_id, COALESCE(SUM(training_load), 0) AS acute_7d
    FROM daily_workout_logs
    WHERE log_date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY player_id
),
chronic_load AS (
    SELECT player_id, (COALESCE(SUM(training_load), 0) / 4.0) AS chronic_weekly_avg
    FROM daily_workout_logs
    WHERE log_date >= CURRENT_DATE - INTERVAL '28 days'
    GROUP BY player_id
)
SELECT 
    p.name, p.jersey_number, p.position,
    a.acute_7d,
    ROUND(c.chronic_weekly_avg, 1) AS chronic_avg,
    ROUND(a.acute_7d / NULLIF(c.chronic_weekly_avg, 0), 2) AS acwr_ratio,
    CASE 
        WHEN (a.acute_7d / NULLIF(c.chronic_weekly_avg, 0)) > 1.5 THEN 'RISIKO TINGGI (OVERLOAD)'
        WHEN (a.acute_7d / NULLIF(c.chronic_weekly_avg, 0)) BETWEEN 0.8 AND 1.3 THEN 'ZONA OPTIMAL (SWEET SPOT)'
        ELSE 'NORMAL / RECOVERY'
    END AS injury_status
FROM players p
JOIN acute_load a ON p.id = a.player_id
JOIN chronic_load c ON p.id = c.player_id
ORDER BY acwr_ratio DESC;`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
