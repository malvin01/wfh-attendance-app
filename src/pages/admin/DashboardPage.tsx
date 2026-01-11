import { useQuery } from "@tanstack/react-query";
import api from "@/api/axiosInstance";
import { Loader2 } from "lucide-react";  
import { useNavigate } from "react-router-dom";

interface DashboardData {
  totalEmployees: number;
  alreadyClockedIn: number;
  notClockedInToday: number;
  alreadyClockedOut: number;
}

export default function AdminDashboard() {
  const { data: dashboardStats, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/attendances/admin/dashboard");
      return response.data.data;
    },
  });

  const navigate = useNavigate();

  const stats = [
    { 
      label: "Total Karyawan", 
      value: dashboardStats?.totalEmployees ?? 0, 
      color: "bg-blue-500" 
    },
    { 
      label: "Sudah Absen", 
      value: dashboardStats?.alreadyClockedIn ?? 0, 
      color: "bg-emerald-500" 
    },
    { 
      label: "Belum Absen", 
      value: dashboardStats?.notClockedInToday ?? 0, 
      color: "bg-orange-500" 
    },
    { 
      label: "Selesai Kerja Hari Ini", 
      value: dashboardStats?.alreadyClockedOut ?? 0, 
      color: "bg-purple-500" 
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-500">Memuat data dashboard...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
        Gagal mengambil data dari server. Pastikan backend menyala.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Summary</h1>
        <p className="text-slate-500">Kondisi absensi karyawan hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-3xl font-black text-slate-800">{s.value}</p>
              <div className={`w-2 h-2 rounded-full ${s.color} mb-2 animate-pulse`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-200">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Selamat Datang, HRD Admin!</h3>
          <p className="text-blue-200 text-sm max-w-md">
            Gunakan portal ini untuk mengelola data karyawan dan memantau kehadiran secara real-time.
          </p>
        </div>
        <button
        type="button"
        onClick={() => navigate("/admin/monitoring")}
        className="bg-white text-blue-900 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all active:scale-95"
      >
        Lihat Laporan Lengkap
      </button>
      </div>
    </div>
  );
}