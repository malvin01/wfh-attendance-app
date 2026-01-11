import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axiosInstance";
import { Search, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export default function AttendanceMonitoring() {
  const [searchInput, setSearchInput] = useState("");
  const [startDateInput, setStartDateInput] = useState("2026-01-01");
  const [endDateInput, setEndDateInput] = useState("2026-01-31");

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    page: 1
  });

  const { data: res, isLoading } = useQuery({
    queryKey: ["attendances", appliedFilters],
    queryFn: async () => {
      const params: any = {
        page: appliedFilters.page,
        limit: 10,
      };

      if (appliedFilters.search && appliedFilters.search.trim() !== "") {
        params.search = appliedFilters.search;
      }

      if (appliedFilters.startDate && appliedFilters.startDate !== "") {
        params.startDate = appliedFilters.startDate;
      }

      if (appliedFilters.endDate && appliedFilters.endDate !== "") {
        params.endDate = appliedFilters.endDate;
      }

      const response = await api.get("/attendances", { params });
      return response.data;
    },
  });

  const allAttendances = res?.data?.attendances || [];
  const meta = res?.data?.meta;

  const handleApplyFilter = () => {
    setAppliedFilters({
      ...appliedFilters,
      search: searchInput,
      startDate: startDateInput,
      endDate: endDateInput,
      page: 1 
    });
  };

  const handleReset = () => {
    setSearchInput("");
    setStartDateInput("2026-01-01");
    setEndDateInput("2026-01-31");
    setAppliedFilters({
      search: "",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      page: 1
    });
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Monitoring Absensi</h1>
        <p className="text-slate-500 text-sm">Filter data berdasarkan nama karyawan dan rentang tanggal.</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Cari nama karyawan..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-5 flex items-center gap-2">
            <div className="relative flex-1">
              <input 
                type="date" 
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                className="w-full pl-3 pr-2 py-2 text-sm rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <span className="text-slate-400">-</span>
            <div className="relative flex-1">
              <input 
                type="date" 
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                className="w-full pl-3 pr-2 py-2 text-sm rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-3 flex gap-2">
            <button 
              onClick={handleApplyFilter}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
            >
              Cari
            </button>
            <button 
              onClick={handleReset}
              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
              title="Reset Filter"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Karyawan</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Masuk</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Pulang</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400">Sedang mengambil data...</td></tr>
              ) : allAttendances.length > 0 ? (
                allAttendances.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {item.employee?.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{item.employee?.fullName}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">{item.employee?.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{item.date}</td>
                    <td className="p-4 text-sm font-semibold text-slate-700 text-center">{formatTime(item.clockInTime)}</td>
                    <td className="p-4 text-sm font-semibold text-slate-700 text-center">{formatTime(item.clockOutTime)}</td>
                    <td className="p-4">
                      {item.clockOutTime ? (
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-100 uppercase">Hadir</span>
                      ) : (
                        <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-1 rounded-md border border-amber-100 uppercase">Aktif</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    Tidak ada data ditemukan untuk kriteria ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
          <p className="text-xs text-slate-500 font-medium">
            Halaman {appliedFilters.page} dari {meta?.totalPages || 1}
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setAppliedFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={appliedFilters.page === 1}
              className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setAppliedFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={appliedFilters.page >= (meta?.totalPages || 1)}
              className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}