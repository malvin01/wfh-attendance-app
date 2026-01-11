import * as z from "zod";
import { de } from "zod/v4/locales";

export const loginSchema = z.object({
  email: z
    .email("Email perusahaan tidak valid")
    .refine((email) => email.split("@")[1] === "dexagroup.com", {
      message: "Harus menggunakan email perusahaan '@dexagroup.com'",
    }),
  password: z.string().min(6, "Password minimal 6 karakter"),
});



