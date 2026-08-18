import { z } from "zod";

import { isoDateSchema, safeImageSchema } from "@/lib/article-schema";

export const certificationIdSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Identificador de certificação inválido.",
  );

const credentialUrlSchema = z
  .string()
  .trim()
  .max(300, "O link da credencial é muito longo.")
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Use uma URL HTTPS válida.");

export const certificationSchema = z
  .object({
    id: certificationIdSchema,
    title: z.string().trim().min(3, "O título precisa ter pelo menos 3 caracteres.").max(120),
    issuer: z.string().trim().min(2, "Informe quem emitiu a certificação.").max(120),
    date: isoDateSchema,
    credentialId: z.string().trim().max(80).optional(),
    credentialUrl: credentialUrlSchema.optional(),
    description: z
      .string()
      .trim()
      .min(10, "A descrição precisa ter pelo menos 10 caracteres.")
      .max(320),
    imagePath: safeImageSchema.optional(),
  })
  .strict();

export type Certification = z.infer<typeof certificationSchema>;

export function validateCertification(value: unknown, source: string): Certification {
  const result = certificationSchema.safeParse(value);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => {
        const field = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
        return `${field}${issue.message}`;
      })
      .join("; ");

    throw new Error(`Certificação inválida em ${source}. ${details}`);
  }

  return result.data;
}
