import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, ClipboardCheck, LogOut, Bell, Settings, Menu, X, Clock, Loader2
} from "lucide-react";
import { useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { setupForegroundListener } from "@/lib/firebase";
import api from "@/api/axiosInstance";
import { toast } from "sonner";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data: countData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = await api.get("/notifications/unread-count");
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const {
    data: notifData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingNotif,
  } = useInfiniteQuery({
    queryKey: ["notifications", "list"],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: '10',
        isRead: 'false',
      });
      
      if (pageParam) {
        params.append('cursor', pageParam);
      }
      
      const res = await api.get(`/notifications?${params.toString()}`);
      return res.data.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination?.hasMore ? lastPage.pagination?.nextCursor : undefined;
    },
    initialPageParam: undefined,
    enabled: isNotifOpen,
  });

  const allNotifications = notifData?.pages.flatMap(page => page.notifications) ?? [];

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    console.log('🎯 [AdminLayout] useEffect called');
    
    const unsubscribe = setupForegroundListener((payload) => {
      const { notification, data } = payload;
      
      if (notification) {
        toast.info(notification.title || 'Notifikasi Baru', {
          description: notification.body,
          duration: 5000,
          id: data?.notificationId || `notif-${Date.now()}`,
        });

        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        
        if (data?.relatedId) {
          queryClient.invalidateQueries({ queryKey: ["employees"] });
        }
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [queryClient]);

  useEffect(() => {
    if (!isNotifOpen || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const target = loadMoreRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [isNotifOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");

      const fcmToken = localStorage.getItem('fcmToken');
      if (fcmToken) {
         await api.delete(`/notifications/token/${encodeURIComponent(fcmToken)}`);
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

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Data Karyawan", path: "/admin/employees", icon: <Users size={20} /> },
    { label: "Monitoring Absen", path: "/admin/monitoring", icon: <ClipboardCheck size={20} /> },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col h-full ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 shrink-0">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Settings size={20} />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">HRD Portal</span>
          <button className="lg:hidden ml-auto text-slate-400" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}>{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-medium text-sm">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-600">
              <Menu size={22} />
            </button>
            <h2 className="font-bold text-slate-800 text-sm lg:text-base">Administrator System</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-full transition-all ${isNotifOpen ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <Bell size={20} />
                {countData?.unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-[10px] text-white flex items-center justify-center rounded-full border-2 border-white font-bold animate-bounce">
                    {countData.unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifikasi Baru</span>
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                        {countData?.unreadCount} Pesan
                      </span>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {isLoadingNotif ? (
                        <div className="p-8 flex justify-center items-center">
                          <Loader2 className="animate-spin text-blue-600" size={24} />
                        </div>
                      ) : allNotifications.length > 0 ? (
                        <>
                          {allNotifications.map((n: any) => (
                            <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                              <p className="text-[11px] font-bold text-blue-600 uppercase mb-1">{n.title}</p>
                              <p className="text-xs text-slate-600 font-medium leading-relaxed">{n.message}</p>
                              <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-2 font-medium">
                                <Clock size={10} /> {new Date(n.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          ))}
                          
                          <div ref={loadMoreRef} className="p-2">
                            {isFetchingNextPage && (
                              <div className="flex justify-center items-center py-2">
                                <Loader2 className="animate-spin text-blue-600" size={16} />
                                <span className="ml-2 text-xs text-slate-500">Memuat...</span>
                              </div>
                            )}
                            {!hasNextPage && allNotifications.length > 5 && (
                              <div className="text-center py-2 text-[10px] text-slate-400 italic">
                                Tidak ada notifikasi lagi
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center text-slate-400 text-xs italic">
                          Tidak ada notifikasi baru
                        </div>
                      )}
                    </div>
                    
                    <Link 
                      to="/admin/notifications" 
                      onClick={() => setIsNotifOpen(false)}
                      className="block p-3 text-center text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-colors uppercase border-t border-slate-100"
                    >
                      Lihat Semua
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-none">Admin HRD</p>
                <p className="text-[10px] text-slate-400 uppercase mt-1">Super Admin</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">HR</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}