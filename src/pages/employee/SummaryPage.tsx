import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axiosInstance";
import { Filter, Search, Clock, FileText, CalendarDays, Loader2 } from "lucide-react";

export default function SummaryPage() {
  const today = new Date().toISOString().split("T")[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);

  const { data: res, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["attendance-history", startDate, endDate],
    queryFn: async () => {
      const response = await api.get("/attendances/me", {
        params: { startDate, endDate },
      });
      return response.data;
    },
  });

  const attendances = res?.data?.attendances || [];
  const summary = res?.data?.summary;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:py-8 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-200">
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Riwayat Absensi</h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Pantau performa kehadiran Anda.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-red-50 focus:border-red-500 outline-none transition-all bg-slate-50/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-red-50 focus:border-red-500 outline-none transition-all bg-slate-50/50"
            />
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-100 disabled:opacity-50"
          >
            {isLoading || isRefetching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            Cari Riwayat
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Kehadiran</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-black text-slate-800">{summary.presentDays}</p>
              <span className="text-xs text-slate-400 font-bold uppercase">Hari</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-red-500">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Durasi Kerja</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-black text-red-600">{summary.totalWorkFormatted || "0h"}</p>
            </div>
          </div>
        </div>
      )}

      {/* DATA AREA */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading || isRefetching ? (
          <div className="p-20 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-red-600" size={32} />
            <p className="text-slate-400 font-medium">Menyinkronkan data...</p>
          </div>
        ) : attendances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Masuk</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Pulang</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase hidden lg:table-cell">Total Jam</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase hidden lg:table-cell">Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {attendances.map((item: any) => (
                  <tr key={item.id} className="hover:bg-red-50/30 transition-colors group">
                    <td className="p-5">
                      <p className="text-sm font-black text-slate-700">
                        {formatDate(item.date)}
                      </p>
                    </td>
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 tabular-nums">
                        <Clock size={12} strokeWidth={3} />
                        {item.clockInTime || "--:--"}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 tabular-nums">
                        <Clock size={12} strokeWidth={3} />
                        {item.clockOutTime || "--:--"}
                      </span>
                    </td>
                    <td className="p-5 hidden lg:table-cell">
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {item.workDurationFormatted || "-"}
                      </span>
                    </td>
                    <td className="p-5 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                        <FileText size={14} />
                        <span className="text-[11px] font-medium italic truncate max-w-[200px]">{item.notes || "Tidak ada catatan"}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-slate-50 p-6 rounded-full text-slate-200">
                <Filter size={48} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-800 font-bold">Data tidak ditemukan</p>
              <p className="text-slate-400 text-sm">Cobalah untuk mengubah rentang tanggal pencarian Anda.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest md:hidden">
        <div className="w-8 h-[1px] bg-slate-200"></div>
        Geser tabel ke samping untuk detail
        <div className="w-8 h-[1px] bg-slate-200"></div>
      </div>
    </div>
  );
}