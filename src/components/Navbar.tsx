import React from 'react';
import { Player, UserRole } from '../types';
import { 
  Shield, 
  Users, 
  User, 
  Database, 
  Bell, 
  FileText, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole | 'database';
  onRoleChange: (role: UserRole | 'database') => void;
  players: Player[];
  selectedPlayerId: string;
  onSelectPlayer: (id: string) => void;
  missingTodayCount: number;
  onOpenReminderModal: () => void;
  onOpenPdfModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  players,
  selectedPlayerId,
  onSelectPlayer,
  missingTodayCount,
  onOpenReminderModal,
  onOpenPdfModal,
}) => {
  const activePlayer = players.find(p => p.id === selectedPlayerId) || players[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-950 flex items-center justify-center shadow-md shadow-emerald-900/20 border border-emerald-600/40">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white uppercase">
                  FUTSAL SMPI AL AZHAR 21
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700">
                  SMP - SMA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Sistem Monitoring Workout, Nutrisi & Performa Fisik Atlet Futsal
              </p>
            </div>
          </div>

          {/* Navigation Mode Switcher Pills */}
          <div className="flex items-center gap-1 sm:gap-2">
            <nav className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => onRoleChange('player')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  currentRole === 'player'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Portal</span> Pemain
              </button>

              <button
                onClick={() => onRoleChange('coach')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  currentRole === 'coach'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span> Pelatih
              </button>

              <button
                onClick={() => onRoleChange('database')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  currentRole === 'database'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Skema</span> Database
              </button>
            </nav>

            {/* If in Player Mode: Athlete Switcher Dropdown */}
            {currentRole === 'player' && (
              <div className="relative hidden lg:block">
                <select
                  value={selectedPlayerId}
                  onChange={(e) => onSelectPlayer(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-3 pr-8 text-xs font-bold text-slate-800 dark:text-white shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id}>
                      #{p.jerseyNumber} {p.name} ({p.grade})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notification Reminder Bell Icon */}
            <button
              onClick={onOpenReminderModal}
              title="Pengingat Atlet yang Belum Input Hari Ini"
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              <Bell className="w-4 h-4" />
              {missingTodayCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center animate-bounce shadow">
                  {missingTodayCount}
                </span>
              )}
            </button>

            {/* Quick Export PDF Button */}
            <button
              onClick={onOpenPdfModal}
              title="Unduh Rapor Evaluasi PDF Bulanan"
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Rapor</span> PDF
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
