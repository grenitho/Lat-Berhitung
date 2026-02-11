import React, { useState, useEffect } from 'react';
import { User, ArrowRight, History, X, Trash2 } from 'lucide-react';
import { getHistory, clearHistory } from '../utils/storage';
import { HistoryRecord } from '../types';

interface WelcomeScreenProps {
  onNext: (name: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const [name, setName] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      onNext(name.trim());
    }
  };

  const loadHistory = () => {
    const data = getHistory();
    setHistoryData(data);
    setShowHistory(true);
  };

  const handleClearHistory = () => {
      if(confirm('Apakah Anda yakin ingin menghapus semua riwayat?')) {
          clearHistory();
          setHistoryData([]);
      }
  }

  return (
    <>
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-slate-100 animate-fade-in relative">
        <div className="absolute top-4 right-4">
            <button 
                onClick={loadHistory}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title="Lihat Riwayat"
            >
                <History className="w-6 h-6" />
            </button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-4 rounded-full">
            <User className="w-10 h-10 text-indigo-600" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-indigo-900 text-center mb-2">Selamat Datang!</h1>
        <p className="text-slate-500 text-center mb-8">
          Masukkan nama Anda untuk memulai latihan matematika dan mendapatkan sertifikat.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-lg"
              placeholder="Contoh: Budi Santoso"
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Lanjut ke Pilihan
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-xl font-bold text-slate-800">Riwayat Latihan</h2>
                    </div>
                    <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-0">
                    {historyData.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            Belum ada riwayat latihan yang tersimpan.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Skor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {historyData.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-sm text-slate-600">
                                            {new Date(record.timestamp).toLocaleDateString('id-ID')}
                                            <div className="text-xs text-slate-400">{new Date(record.timestamp).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-800">{record.userName}</td>
                                        <td className="p-4">
                                            <span className={`inline-block w-8 h-8 leading-8 text-center rounded-lg font-bold text-sm
                                                ${record.grade === 'A' ? 'bg-yellow-100 text-yellow-700' : 
                                                  record.grade === 'B' ? 'bg-green-100 text-green-700' :
                                                  record.grade === 'C' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}
                                            `}>
                                                {record.grade}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-right">
                                            <div className="font-bold text-slate-700">{record.correct}/{record.total}</div>
                                            <div className="text-xs text-slate-400">{record.timeString}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 rounded-b-2xl">
                    <button 
                        onClick={handleClearHistory}
                        disabled={historyData.length === 0}
                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-4 h-4" /> Hapus Semua
                    </button>
                    <button 
                        onClick={() => setShowHistory(false)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};