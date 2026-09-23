import React, { useState } from 'react';
import { Player, DailyWorkoutLog, ReminderNotification } from '../types';
import { addReminderRecord, getStoredReminders } from '../utils/storage';
import { 
  Bell, 
  X, 
  Send, 
  CheckCheck, 
  MessageCircle, 
  AlertCircle, 
  Phone, 
  Clock, 
  Users,
  Copy,
  Check
} from 'lucide-react';

interface ReminderCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  logs: DailyWorkoutLog[];
  onReminderSent: () => void;
}

export const ReminderCenterModal: React.FC<ReminderCenterModalProps> = ({
  isOpen,
  onClose,
  players,
  logs,
  onReminderSent,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const remindersHistory = getStoredReminders();

  // Find players who haven't logged today
  const playersWithoutLogToday = players.filter((player) => {
    return !logs.some(l => l.playerId === player.id && l.date === todayStr);
  });

  const generateWhatsappMessage = (player: Player): string => {
    return `Assalamualaikum Wr. Wb. Ananda *${player.name}* (No. #${player.jerseyNumber} ${player.position} - ${player.grade}) Skuad FUTSAL SMPI AL AZHAR 21.

Mengingatkan untuk segera melengkapi data *Daily Workout & Nutrisi Harian* untuk tanggal *${todayStr}* pada portal atlet. Pemantauan beban latihan (RPE), durasi tidur & hidrasi sangat penting untuk evaluasi fisik dan pencegahan cedera.

Terima kasih atas disiplin dan komitmennya.
Salam Prestasi, Tim Pelatih Futsal SMPI Al Azhar 21.`;
  };

  const handleSendSingleReminder = (player: Player) => {
    const message = generateWhatsappMessage(player);

    // Save reminder log
    const reminderLog: ReminderNotification = {
      id: `rem-${player.id}-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      playerPhone: player.phone,
      date: todayStr,
      status: 'sent',
      sentAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      channel: 'whatsapp',
      message,
    };

    addReminderRecord(reminderLog);
    onReminderSent();

    // Open WhatsApp Web/App
    const cleanPhone = player.phone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    setNotificationToast(`Pengingat berhasil dikirim ke WhatsApp ${player.name}!`);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  const handleBroadcastAll = () => {
    if (playersWithoutLogToday.length === 0) return;

    playersWithoutLogToday.forEach((player) => {
      const message = generateWhatsappMessage(player);
      const reminderLog: ReminderNotification = {
        id: `rem-${player.id}-${Date.now()}`,
        playerId: player.id,
        playerName: player.name,
        playerPhone: player.phone,
        date: todayStr,
        status: 'sent',
        sentAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        channel: 'in_app',
        message: `Pengingat otomatis sistem: Lengkapi catatan workout tanggal ${todayStr}`,
      };
      addReminderRecord(reminderLog);
    });

    onReminderSent();
    setNotificationToast(`Notifikasi sistem in-app berhasil di-broadcast ke ${playersWithoutLogToday.length} pemain!`);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  const copyBroadcastText = () => {
    const names = playersWithoutLogToday.map((p, idx) => `${idx + 1}. ${p.name} (${p.grade})`).join('\n');
    const broadcastText = `*PENGINGAT RESMI TIM PELATIH - FUTSAL SMPI AL AZHAR 21*
Tanggal: ${todayStr}

Diberitahukan kepada ananda atlet yang belum mengisi log harian workout & nutrisi hari ini:
${names}

Mohon segera melengkapi input data malam ini sebelum pukul 21:00 WIB untuk rekapitulasi pelatih fisik.
Wassalamu'alaikum Wr. Wb.`;

    navigator.clipboard.writeText(broadcastText);
    setCopiedBroadcast(true);
    setTimeout(() => setCopiedBroadcast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-emerald-800 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 flex items-center justify-center border border-emerald-600">
              <Bell className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold">Pusat Notifikasi & Pengingat Latihan</h2>
              <p className="text-xs text-emerald-200">
                FUTSAL SMPI AL AZHAR 21 • Pemantauan Kepatuhan Input Harian
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

        {/* Feedback Alert Toast */}
        {notificationToast && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4" /> {notificationToast}
            </span>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'pending'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Belum Input Hari Ini ({playersWithoutLogToday.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            Riwayat Notifikasi ({remindersHistory.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {/* Summary Bar */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    {playersWithoutLogToday.length > 0
                      ? `${playersWithoutLogToday.length} Pemain Belum Input Data Tanggal ${todayStr}`
                      : `Semua Pemain (${players.length}) Telah Menginput Data Hari Ini!`}
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                    Kirimkan peringatan langsung melalui WhatsApp atau broadcast ke grup wali murid.
                  </p>
                </div>

                {playersWithoutLogToday.length > 0 && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={copyBroadcastText}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition"
                    >
                      {copiedBroadcast ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      Salin Teks Broadcast
                    </button>
                    <button
                      onClick={handleBroadcastAll}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      In-App Alert Semua
                    </button>
                  </div>
                )}
              </div>

              {/* List of Players */}
              {playersWithoutLogToday.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                    <CheckCheck className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-bold text-slate-800 dark:text-white">Kepatuhan 100%!</h5>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Seluruh pemain futsal SMPI Al Azhar 21 telah mengirimkan data workout dan nutrisi hari ini.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {playersWithoutLogToday.map((player) => (
                    <div 
                      key={player.id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={player.avatarUrl} 
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700" 
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {player.name}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              #{player.jerseyNumber} • {player.position}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {player.grade} ({player.level}) • WA: +{player.phone}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSendSingleReminder(player)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Kirim WA
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {remindersHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  Belum ada log pengingat yang terkirim pada sesi ini.
                </p>
              ) : (
                <div className="space-y-2">
                  {remindersHistory.slice(0, 10).map((rem) => (
                    <div 
                      key={rem.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 dark:text-white">
                          {rem.playerName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {rem.sentAt} • Saluran: {rem.channel.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                        {rem.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
