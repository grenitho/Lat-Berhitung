import React, { useState } from 'react';
import { Settings, Play } from 'lucide-react';
import { OperationType, SECONDS_PER_QUESTION } from '../types';
import { determineMaxNumber } from '../utils/mathGame';

interface ConfigScreenProps {
  userName: string;
  onStart: (op: OperationType, count: number, maxNum: number) => void;
}

export const ConfigScreen: React.FC<ConfigScreenProps> = ({ userName, onStart }) => {
  const [opType, setOpType] = useState<OperationType | null>(null);
  const [count, setCount] = useState<number | null>(null);

  const handleStart = () => {
    if (opType && count) {
      const maxNum = determineMaxNumber(count);
      onStart(opType, count, maxNum);
    }
  };

  const getTimeEstimate = (qCount: number) => {
    return Math.ceil((qCount * SECONDS_PER_QUESTION) / 60);
  };

  return (
    <div className="w-full max-w-xl bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-slate-100 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 p-2 rounded-lg">
          <Settings className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Konfigurasi Latihan</h2>
      </div>

      <p className="text-slate-600 mb-8">
        Halo, <span className="font-bold text-indigo-700">{userName}</span>. Pilih jenis latihanmu hari ini.
      </p>

      {/* Operation Selection */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">1. Jenis Operasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setOpType('BASIC')}
            className={`p-5 rounded-xl border-2 text-center transition-all duration-200 ${
              opType === 'BASIC'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-600'
                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-3xl font-black mb-1">➕ & ➖</div>
            <div className="text-sm font-medium">Penjumlahan & Pengurangan</div>
          </button>
          
          <button
            onClick={() => setOpType('FULL')}
            className={`p-5 rounded-xl border-2 text-center transition-all duration-200 ${
              opType === 'FULL'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-600'
                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-3xl font-black mb-1">➕ ➖ ✖️ ➗</div>
            <div className="text-sm font-medium">4 Operasi Lengkap</div>
          </button>
        </div>
      </div>

      {/* Count Selection */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">2. Jumlah Soal & Kesulitan</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[25, 50, 100, 150, 200].map((num) => (
            <button
              key={num}
              onClick={() => setCount(num)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                count === num
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div className="text-xl font-bold">{num}</div>
              <div className="text-xs text-slate-500">~{getTimeEstimate(num)} Menit</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!opType || !count}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md active:scale-95 text-lg"
      >
        <Play className="w-6 h-6 fill-current" />
        Mulai Latihan
      </button>

      {count && (
        <p className="text-center text-xs text-slate-400 mt-4">
          Waktu pengerjaan: 10 detik per soal. Angka maksimal: {determineMaxNumber(count)}.
        </p>
      )}
    </div>
  );
};
