import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { Download, Share2, Home, Loader2, Image as ImageIcon } from 'lucide-react';
import { GameConfig, GameStats } from '../types';
import { calculateGrade, formatTime } from '../utils/mathGame';
import { saveHistory } from '../utils/storage';

interface ResultScreenProps {
  config: GameConfig;
  stats: GameStats;
  onReset: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ config, stats, onReset }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const hasSavedRef = useRef(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { grade, colorClass } = calculateGrade(
    stats.correct,
    stats.totalAttempted,
    config.questionCount,
    stats.isTimeUp
  );

  const totalTimeSeconds = Math.floor((stats.endTime - stats.startTime) / 1000);
  const formattedTime = formatTime(totalTimeSeconds);

  // Auto-save history on mount
  useEffect(() => {
    if (!hasSavedRef.current) {
        saveHistory({
            id: Date.now().toString(),
            timestamp: Date.now(),
            userName: config.userName,
            operation: config.operation,
            grade: grade,
            correct: stats.correct,
            total: config.questionCount,
            timeString: formattedTime
        });
        hasSavedRef.current = true;
    }
  }, [config, stats, grade, formattedTime]);

  // Confetti effect
  useEffect(() => {
    if (grade === 'A' || grade === 'B') {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#4f46e5', '#10b981', '#f59e0b']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4f46e5', '#10b981', '#f59e0b']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [grade]);

  const handleDownloadText = () => {
    const opText = config.operation === 'FULL' ? '4 Operasi Dasar' : 'Penjumlahan & Pengurangan';
    const content = `
===== SERTIFIKAT LATIHAN MATEMATIKA =====
Nama: ${config.userName}
Program: ${opText} (${config.questionCount} Soal)

NILAI AKHIR: ${grade}

Statistik:
- Soal Terjawab: ${stats.totalAttempted} / ${config.questionCount}
- Benar: ${stats.correct}
- Salah: ${stats.incorrect}
- Waktu: ${formattedTime} ${stats.isTimeUp ? '(Waktu Habis)' : '(Selesai)'}

Teruslah berlatih dan tingkatkan kemampuanmu!
==========================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sertifikat_${config.userName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateImage = async (): Promise<Blob | null> => {
    if (!certificateRef.current) return null;
    try {
        const canvas = await html2canvas(certificateRef.current, {
            scale: 2, // Higher quality
            backgroundColor: '#ffffff',
            useCORS: true
        });
        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/png');
        });
    } catch (err) {
        console.error("Image generation failed", err);
        return null;
    }
  };

  const handleShareImage = async () => {
    setIsGenerating(true);
    const blob = await generateImage();
    
    if (blob) {
        const file = new File([blob], 'sertifikat-matematika.png', { type: 'image/png' });
        
        // Try Web Share API Level 2 (Files)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'Hasil Latihan Matematika',
                    text: `Saya mendapat nilai ${grade} di latihan matematika!`,
                });
            } catch (error) {
                console.log("Sharing failed or cancelled", error);
            }
        } else {
            // Fallback: Download image
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Sertifikat_${config.userName.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert("Fitur 'Share langsung' tidak didukung browser ini. Gambar telah diunduh, silakan bagikan secara manual.");
        }
    }
    setIsGenerating(false);
  };

  return (
    <div className="w-full max-w-2xl animate-fade-in flex flex-col gap-6">
        
        {/* Certificate Card - This part gets screenshotted */}
        <div 
            ref={certificateRef}
            className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl border-4 border-indigo-600 relative overflow-hidden"
        >
            {/* Background Decorative Circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full z-0 opacity-50"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-50 rounded-full z-0 opacity-50"></div>

            <div className="relative z-10 text-center">
                <h2 className="text-3xl font-extrabold text-indigo-900 mb-2 uppercase tracking-wide">Sertifikat Hasil</h2>
                <p className="text-slate-500 mb-6">Latihan Matematika Kumon Style</p>

                <div className="border-b-2 border-slate-100 pb-6 mb-6">
                    <p className="text-slate-500 mb-1">Diberikan kepada:</p>
                    <h1 className="text-4xl font-black text-slate-800 break-words">{config.userName}</h1>
                </div>

                <div className={`mx-auto w-32 h-32 flex items-center justify-center rounded-full border-8 text-7xl font-black shadow-lg mb-8 ${colorClass}`}>
                    {grade}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2 text-left bg-slate-50 p-6 rounded-xl">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Total Soal</p>
                        <p className="text-lg font-bold text-slate-700">{config.questionCount}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Terjawab</p>
                        <p className="text-lg font-bold text-indigo-600">{stats.totalAttempted}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Benar</p>
                        <p className="text-lg font-bold text-green-600">{stats.correct}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Waktu</p>
                        <p className={`text-lg font-bold ${stats.isTimeUp ? 'text-red-500' : 'text-slate-700'}`}>{formattedTime}</p>
                    </div>
                </div>
                <div className="mt-4 text-xs text-slate-400">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>
        </div>

        {/* Action Buttons - Outside the screenshot area */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <h3 className="text-center font-bold text-slate-700 mb-4">Bagikan Hasil Anda</h3>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <button 
                    onClick={handleDownloadText}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-all"
                >
                    <Download className="w-5 h-5" /> Teks (.txt)
                </button>
                <button 
                    onClick={handleShareImage}
                    disabled={isGenerating}
                    className="flex-[2] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Memproses...
                        </>
                    ) : (
                        <>
                            <Share2 className="w-5 h-5" /> Bagikan Gambar (WA/IG)
                        </>
                    )}
                </button>
            </div>

            <button 
                onClick={onReset}
                className="text-slate-400 hover:text-indigo-600 font-medium flex items-center justify-center gap-2 mx-auto transition-colors w-full py-2"
            >
                <Home className="w-4 h-4" /> Kembali ke Halaman Utama
            </button>
        </div>
    </div>
  );
};