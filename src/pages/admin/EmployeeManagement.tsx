import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/api/axiosInstance";
import { employeeSchema, type EmployeeFormValues } from "@/schemas/employeeSchema";
import {
  Plus, Edit2, X, Save, Search,
  ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function EmployeeManagement() {
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const { data: res, isLoading } = useQuery({
    queryKey: ["employees", page, appliedSearch],
    queryFn: async () => {
      const params: any = { 
        page, 
        limit: 10,
        ...(appliedSearch && { search: appliedSearch })
      };
      const response = await api.get("/employees", { params });
      return response.data;
    },
  });

  const employeeList = res?.data?.data || [];
  const meta = res?.data?.meta;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { isActive: true, role: "employee" }
  });

  const mutation = useMutation({
    mutationFn: async (data: EmployeeFormValues) => {
        if (editingId) {
            const updateBody = {
                fullName: data.fullName,
                position: data.position,
                isActive: data.isActive,
                phoneNumber: data.phoneNumber
            };
            return await api.patch(`/employees/${editingId}`, updateBody);
        } else {
            const { isActive, ...createBody } = data; 
            return await api.post("/employees", createBody);
        }
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
        closeModal();
        toast.success("Berhasil!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal")
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchInput);
    setPage(1); 
  };

  const handleEditClick = async (id: string) => {
    setEditingId(id);
    setIsDetailLoading(true);
    setIsModalOpen(true);
    try {
      const response = await api.get(`/employees/${id}`);
      const emp = response.data.data;
      setValue("fullName", emp.fullName);
      setValue("email", emp.email);
      setValue("position", emp.position);
      setValue("phoneNumber", emp.phoneNumber);
      setValue("role", emp.role);
      setValue("isActive", emp.isActive ? "true" : "false" as any);
    } catch (error) {
      toast.error("Gagal mengambil detail");
      closeModal();
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    reset({ isActive: true, role: "employee", password: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Karyawan</h1>
          <p className="text-slate-500 text-sm">Kelola data dan akses akun seluruh karyawan.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Tambah Karyawan
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Cari nama atau email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors">
            Cari
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Karyawan</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jabatan</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-400 animate-pulse">Memuat data...</td></tr>
              ) : employeeList.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">Data karyawan tidak ditemukan.</td></tr>
              ) : employeeList.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {emp.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{emp.fullName}</p>
                        <p className="text-[11px] text-slate-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600">{emp.position}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${emp.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                      {emp.isActive ? "AKTIF" : "NONAKTIF"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleEditClick(emp.id)} 
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium italic">
            Menampilkan {employeeList.length} dari {meta?.total || 0} karyawan
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-100 transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-md shadow-sm">
                {page}
              </span>
              <span className="text-xs text-slate-400 mx-1">/</span>
              <span className="text-xs font-bold text-slate-500">
                {meta?.totalPages || 1}
              </span>
            </div>
            <button 
              disabled={page >= (meta?.totalPages || 1)}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-100 transition-all shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full h-[92%] sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom sm:zoom-in duration-300">            
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingId ? "Edit Karyawan" : "Tambah Karyawan"}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Data Informasi Akun</p>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
              {isDetailLoading ? (
                <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                  <p className="text-sm font-medium">Mengambil data detail...</p>
                </div>
              ) : (
                <form id="employee-form" onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nama Lengkap</label>
                      <input 
                        {...register("fullName")} 
                        placeholder="Masukkan nama sesuai KTP"
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50" 
                      />
                      {errors.fullName && <p className="text-red-500 text-[10px] ml-1">{errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Perusahaan</label>
                      <input 
                        {...register("email")} 
                        disabled={!!editingId} 
                        placeholder="name@dexagroup.com"
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed outline-none" 
                      />
                      {errors.email && <p className="text-red-500 text-[10px] ml-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Jabatan / Posisi</label>
                      <input 
                        {...register("position")} 
                        placeholder="Contoh: HR Manager"
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50" 
                      />
                      {errors.position && <p className="text-red-500 text-[10px] ml-1">{errors.position.message}</p>}
                    </div>

                    <div className={`space-y-1.5 ${!editingId ? 'sm:col-span-2' : 'sm:col-span-1'}`}>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nomor WhatsApp</label>
                      <input 
                        {...register("phoneNumber")} 
                        placeholder="0812xxxx"
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50" 
                      />
                      {errors.phoneNumber && <p className="text-red-500 text-[10px] ml-1">{errors.phoneNumber.message}</p>}
                    </div>

                    {editingId && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Status Keaktifan</label>
                        <select 
                          {...register("isActive", { setValueAs: (v) => v === "true" })} 
                          className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50/50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        >
                          <option value="true">🟢 Aktif</option>
                          <option value="false">🔴 Nonaktif</option>
                        </select>
                      </div>
                    )}

                    {!editingId && (
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password Baru</label>
                        <input 
                          type="password" 
                          {...register("password")} 
                          placeholder="Minimal 6 karakter"
                          className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50" 
                        />
                        {errors.password && <p className="text-red-500 text-[10px] ml-1">{errors.password.message}</p>}
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
              <button 
                type="button" 
                onClick={closeModal} 
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-white transition-all active:scale-95"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="employee-form"
                disabled={mutation.isPending} 
                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {mutation.isPending ? (
                  <> <Loader2 size={16} className="animate-spin" /> Memproses... </>
                ) : (
                  <> <Save size={16} /> Simpan Data </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}