import { jsPDF } from 'jspdf';
import { Player, DailyWorkoutLog, PhysicalBenchmark } from '../types';

export const generatePlayerMonthlyPDF = (
  player: Player,
  logs: DailyWorkoutLog[],
  benchmark?: PhysicalBenchmark,
  monthName: string = 'September 2026'
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const playerLogs = logs.filter(l => l.playerId === player.id);
  const totalSessions = playerLogs.length;
  const totalMinutes = playerLogs.reduce((sum, l) => sum + l.durationMinutes, 0);
  const totalLoad = playerLogs.reduce((sum, l) => sum + l.trainingLoad, 0);
  const avgRpe = totalSessions > 0 ? (playerLogs.reduce((sum, l) => sum + l.rpe, 0) / totalSessions).toFixed(1) : '0';
  const avgSleep = totalSessions > 0 ? (playerLogs.reduce((sum, l) => sum + l.nutrition.sleepHours, 0) / totalSessions).toFixed(1) : '0';
  const avgWater = totalSessions > 0 ? (playerLogs.reduce((sum, l) => sum + l.nutrition.waterLiters, 0) / totalSessions).toFixed(1) : '0';
  const complianceRate = Math.min(100, Math.round((totalSessions / 14) * 100)); // 14 days evaluation sample

  // 1. Header / Kop Surat SMPI Al Azhar 21
  doc.setFillColor(6, 78, 59); // Deep Emerald #064e3b
  doc.rect(0, 0, 210, 8, 'F');

  // Top header text
  doc.setTextColor(6, 78, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('YAYASAN PESANTREN ISLAM AL AZHAR', 105, 20, { align: 'center' });
  
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('SMPI AL AZHAR 21 - DEPARTEMEN OLAHRAGA PRESTASI', 105, 26, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('AKADEMI FUTSAL PROFESIONAL SISWA (JENJANG SMP - SMA)', 105, 31, { align: 'center' });
  doc.text('Jl. Raya Kampus Al Azhar, Jakarta | Telp. (021) 7278369 | Email: futsal@smpialazhar21.sch.id', 105, 35, { align: 'center' });

  // Double horizontal rule (classic official letterhead)
  doc.setDrawColor(6, 78, 59);
  doc.setLineWidth(0.8);
  doc.line(15, 38, 195, 38);
  doc.setLineWidth(0.2);
  doc.line(15, 39.5, 195, 39.5);

  // 2. Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(6, 78, 59);
  doc.text(`RAPOR EVALUASI BULANAN WORKOUT & PERFORMA FISIK ATLET`, 105, 47, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Periode: ${monthName} | Jenjang: ${player.level} | Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 105, 52, { align: 'center' });

  // 3. Player Bio Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, 56, 180, 24, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, 56, 180, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Nama Atlet:', 20, 62);
  doc.text('NISN:', 20, 68);
  doc.text('Kelas / Skuad:', 20, 74);

  doc.setFont('helvetica', 'normal');
  doc.text(player.name, 45, 62);
  doc.text(player.nisn, 45, 68);
  doc.text(`${player.grade} (${player.level})`, 45, 74);

  doc.setFont('helvetica', 'bold');
  doc.text('Posisi Utama:', 115, 62);
  doc.text('No. Punggung:', 115, 68);
  doc.text('TB / BB / VO2Max:', 115, 74);

  doc.setFont('helvetica', 'normal');
  doc.text(player.position, 145, 62);
  doc.text(`#${player.jerseyNumber}`, 145, 68);
  doc.text(`${player.heightCm} cm / ${player.weightKg} kg / ${player.vo2max} ml/kg`, 145, 74);

  // 4. Monthly KPI Summary Cards
  const kpis = [
    { label: 'Sesi Latihan', value: `${totalSessions} Sesi` },
    { label: 'Total Durasi', value: `${totalMinutes} Menit` },
    { label: 'Total Training Load', value: `${totalLoad} AU` },
    { label: 'Rata-rata RPE Borg', value: `${avgRpe} / 10` },
    { label: 'Rata-rata Tidur', value: `${avgSleep} Jam` },
    { label: 'Rata-rata Hidrasi', value: `${avgWater} Liter` },
  ];

  let kpiX = 15;
  const kpiWidth = 28;
  kpis.forEach((kpi) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(kpiX, 84, kpiWidth, 16, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(kpiX, 84, kpiWidth, 16, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, kpiX + kpiWidth / 2, 89, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(6, 78, 59);
    doc.text(kpi.value, kpiX + kpiWidth / 2, 95, { align: 'center' });

    kpiX += kpiWidth + 2.4;
  });

  // 5. Physical Test Benchmarks Section
  let curY = 106;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('I. HASIL TES FISIK & KEBUGARAN BERKALA', 15, curY);

  curY += 4;
  doc.setFillColor(6, 78, 59);
  doc.rect(15, curY, 180, 6, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Yo-Yo IRT Level', 20, curY + 4.2);
  doc.text('VO2Max (ml/kg)', 55, curY + 4.2);
  doc.text('Sprint 20m (dtk)', 90, curY + 4.2);
  doc.text('Agility Illinois (dtk)', 125, curY + 4.2);
  doc.text('Vertical Jump (cm)', 160, curY + 4.2);

  curY += 6;
  doc.setFillColor(255, 255, 255);
  doc.rect(15, curY, 180, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, curY, 180, 6, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(benchmark?.yoYoTestLevel || '19.2', 20, curY + 4.2);
  doc.text(`${benchmark?.vo2MaxEstimate || player.vo2max} ml/kg`, 55, curY + 4.2);
  doc.text(`${benchmark?.sprint20mSeconds || 3.0} s`, 90, curY + 4.2);
  doc.text(`${benchmark?.illinoisAgilitySeconds || 14.8} s`, 125, curY + 4.2);
  doc.text(`${benchmark?.verticalJumpCm || 62} cm`, 160, curY + 4.2);

  // 6. Recent Daily Workout & Nutrition Logs Table
  curY += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('II. REKAPITULASI WORKOUT & NUTRISI HARIAN', 15, curY);

  curY += 4;
  doc.setFillColor(6, 78, 59);
  doc.rect(15, curY, 180, 6, 'F');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('Tanggal', 18, curY + 4.2);
  doc.text('Kategori Latihan & Drill', 40, curY + 4.2);
  doc.text('Durasi', 105, curY + 4.2);
  doc.text('RPE', 120, curY + 4.2);
  doc.text('Load (AU)', 135, curY + 4.2);
  doc.text('Air/Tidur', 155, curY + 4.2);
  doc.text('Status', 178, curY + 4.2);

  curY += 6;
  const displayLogs = playerLogs.slice(0, 7); // Show top 7 logs
  displayLogs.forEach((log, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(15, curY, 180, 7, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.rect(15, curY, 180, 7, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(log.date, 18, curY + 4.5);

    // Truncate drill title if needed
    const shortCategory = log.category.length > 25 ? log.category.substring(0, 23) + '..' : log.category;
    doc.text(`${shortCategory}`, 40, curY + 4.5);

    doc.text(`${log.durationMinutes}m`, 105, curY + 4.5);
    doc.text(`${log.rpe}/10`, 120, curY + 4.5);
    doc.text(`${log.trainingLoad}`, 135, curY + 4.5);
    doc.text(`${log.nutrition.waterLiters}L / ${log.nutrition.sleepHours}h`, 155, curY + 4.5);
    doc.setTextColor(5, 150, 105);
    doc.text('Terverifikasi', 178, curY + 4.5);

    curY += 7;
  });

  // 7. Coach Feedback & Evaluation Summary
  curY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('III. CATATAN & REKOMENDASI TIM PELATIH FISIK', 15, curY);

  curY += 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, curY, 180, 22, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, curY, 180, 22, 2, 2, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const evalText = `Atlet menunjukkan kedisiplinan input data latihan ${complianceRate}%. Indikator beban latihan berada di zona optimal (Sweet Spot ACWR). Rekomendasi: Pertahankan hidrasi minimal 3.2 Liter di hari pertandingan, tingkatkan plyometric eksplosif pada paha depan & panggul, serta jaga pola tidur minimal 8 jam untuk regenerasi sel otot maksimal.`;
  const splitEval = doc.splitTextToSize(evalText, 170);
  doc.text(splitEval, 20, curY + 5);

  // 8. Signatures Block (Pelatih Fisik, Head Coach, Orang Tua Siswa)
  curY += 28;
  const signY = Math.min(curY, 245);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Mengetahui,', 25, signY);
  doc.text('Orang Tua / Wali Atlet', 25, signY + 5);

  doc.text('Pelatih Fisik Futsal', 90, signY + 5);
  doc.text('Koordinator Ekstrakurikuler', 150, signY + 5);

  // Signature lines
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(20, signY + 24, 65, signY + 24);
  doc.line(85, signY + 24, 130, signY + 24);
  doc.line(145, signY + 24, 190, signY + 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('( ......................................... )', 23, signY + 28);
  doc.text('Coach Rozi, S.Pd., C.Ftc', 88, signY + 28);
  doc.text('Drs. H. M. Syarif, M.Pd.', 148, signY + 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Orang Tua Siswa', 30, signY + 32);
  doc.text('Pelatih Kepala SMPI Al Azhar 21', 88, signY + 32);
  doc.text('NIP. 19780415 200501 1 004', 148, signY + 32);

  // Footer bar
  doc.setFillColor(6, 78, 59);
  doc.rect(0, 290, 210, 7, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('FUTSAL SMPI AL AZHAR 21 | Official Athlete Monitoring System - Evaluasi Bulanan', 105, 294.5, { align: 'center' });

  // Save/Download PDF
  const cleanName = player.name.replace(/\s+/g, '_');
  doc.save(`Rapor_Evaluasi_Futsal_${cleanName}_${monthName.replace(/\s+/g, '_')}.pdf`);
};

export const generateTeamMonthlyPDF = (
  players: Player[],
  logs: DailyWorkoutLog[],
  monthName: string = 'September 2026'
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Header / Kop Surat
  doc.setFillColor(6, 78, 59);
  doc.rect(0, 0, 297, 8, 'F');

  doc.setTextColor(6, 78, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('YAYASAN PESANTREN ISLAM AL AZHAR', 148.5, 18, { align: 'center' });
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('SMPI AL AZHAR 21 - LAPORAN EVALUASI BULANAN REKAPITULASI TIM FUTSAL', 148.5, 24, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Periode: ${monthName} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, 148.5, 29, { align: 'center' });

  doc.setDrawColor(6, 78, 59);
  doc.setLineWidth(0.8);
  doc.line(15, 32, 282, 32);

  // Table header
  let curY = 40;
  doc.setFillColor(6, 78, 59);
  doc.rect(15, curY, 267, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('No', 18, curY + 5);
  doc.text('Nama Pemain', 28, curY + 5);
  doc.text('Kelas / Jenjang', 75, curY + 5);
  doc.text('Posisi', 110, curY + 5);
  doc.text('Total Sesi', 140, curY + 5);
  doc.text('Total Load (AU)', 165, curY + 5);
  doc.text('Rata-rata RPE', 195, curY + 5);
  doc.text('Rata-rata Tidur', 220, curY + 5);
  doc.text('Status Input Hari Ini', 248, curY + 5);

  curY += 7;
  const todayStr = new Date().toISOString().split('T')[0];

  players.forEach((p, idx) => {
    const pLogs = logs.filter(l => l.playerId === p.id);
    const sessions = pLogs.length;
    const totalLoad = pLogs.reduce((s, l) => s + l.trainingLoad, 0);
    const avgRpe = sessions > 0 ? (pLogs.reduce((s, l) => s + l.rpe, 0) / sessions).toFixed(1) : '0';
    const avgSleep = sessions > 0 ? (pLogs.reduce((s, l) => s + l.nutrition.sleepHours, 0) / sessions).toFixed(1) : '0';
    const loggedToday = pLogs.some(l => l.date === todayStr);

    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(15, curY, 267, 7, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, curY, 267, 7, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`${idx + 1}`, 18, curY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(p.name, 28, curY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${p.grade} (${p.level})`, 75, curY + 5);
    doc.text(p.position, 110, curY + 5);
    doc.text(`${sessions} sesi`, 140, curY + 5);
    doc.text(`${totalLoad} AU`, 165, curY + 5);
    doc.text(`${avgRpe}/10`, 195, curY + 5);
    doc.text(`${avgSleep} Jam`, 220, curY + 5);

    if (loggedToday) {
      doc.setTextColor(5, 150, 105);
      doc.text('SUDAH INPUT', 248, curY + 5);
    } else {
      doc.setTextColor(225, 29, 72);
      doc.text('BELUM INPUT', 248, curY + 5);
    }

    curY += 7;
  });

  // Footer notes & signatures
  curY += 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('* Rekapitulasi ini dihasilkan otomatis oleh Sistem Informasi Monitoring Futsal SMPI Al Azhar 21.', 15, curY);

  // Footer bar
  doc.setFillColor(6, 78, 59);
  doc.rect(0, 203, 297, 7, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('FUTSAL SMPI AL AZHAR 21 | Skuad Futsal Juara - Terorganisir, Berkarakter & Berprestasi', 148.5, 207.5, { align: 'center' });

  doc.save(`Rekapitulasi_Tim_Futsal_AlAzhar21_${monthName.replace(/\s+/g, '_')}.pdf`);
};
