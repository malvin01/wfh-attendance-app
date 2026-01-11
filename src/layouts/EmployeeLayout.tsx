import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  User, 
  Fingerprint, 
  History, 
  LogOut, 
  Bell,
  LayoutGrid
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosInstance";
import { toast } from "sonner";

export default function EmployeeLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

 const handleLogout = async () => {
    try {
      await api.post("/auth/logout");

      const fcmToken = localStorage.getItem('fcmToken');
      if (fcmToken) {
         await api.delete(`/employees/token/${encodeURIComponent(fcmToken)}`);
      }

      toast.success("Berhasil keluar");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Gagal logout secara server, membersihkan sesi lokal...");
    } finally {
      localStorage.clear();
      queryClient.clear();
      navigate("/", { replace: true });
    }
  };

  const navItems = [
    { label: "Absen", path: "/employee/attendance", icon: <Fingerprint size={22} /> },
    { label: "Riwayat", path: "/employee/summary", icon: <History size={22} /> },
    { label: "Profil", path: "/employee/profile", icon: <User size={22} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* --- TOPBAR (Desktop & Mobile) --- */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg shadow-lg shadow-red-200">
              <LayoutGrid size={18} className="text-white" />
            </div>
            <span className="text-lg font-black text-slate-800 tracking-tighter uppercase">
              WFH<span className="text-red-600">Portal</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold text-xs uppercase">
              ME
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 pb-32">
        <Outlet /> 
      </main>

      {/* --- BOTTOM NAVIGATION (Mobile-First Design) --- */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] p-2 shadow-2xl shadow-slate-900/40 z-50 border border-white/10">
        <div className="flex justify-between items-center px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`relative flex flex-col items-center gap-1 py-2 px-4 rounded-[2rem] transition-all duration-300 ${
                  isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <div className="absolute inset-0 bg-red-600 rounded-[1.5rem] -z-10 animate-in zoom-in duration-300"></div>
                )}
                
                <div className={`${isActive ? "scale-110" : "scale-100"} transition-transform`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "opacity-100" : "opacity-60"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* LOGOUT BUTTON */}
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 py-2 px-4 text-slate-500 hover:text-red-400 transition-all active:scale-90"
          >
            <LogOut size={22} />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Keluar</span>
          </button>
        </div>
      </nav>

      {/* Tampilan khusus untuk Desktop: Hint agar user tahu ini Mobile-First */}
      <div className="hidden lg:block fixed bottom-4 right-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
        Optimized for Mobile Access
      </div>

    </div>
  );
}