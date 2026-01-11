import * as z from "zod";

export const employeeSchema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.email("Email perusahaan tidak valid")
    .refine((email) => email.split("@")[1] === "dexagroup.com", {
      message: "Harus menggunakan email perusahaan '@dexagroup.com'",
    }),
  position: z.string().min(2, "Jabatan harus diisi"),
  phoneNumber: z.string().min(10, "Nomor HP minimal 10 digit"),
  role: z.string().min(1, "Role wajib diisi"), 
  isActive: z.boolean(),
  password: z.string().optional().or(z.literal('')),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;