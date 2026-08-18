import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";

import { zodFieldErrors } from "@/lib/admin/article-content";
import {
  certificationSchema,
  type Certification,
} from "@/lib/certification-schema";

const editorFieldsSchema = z.object({
  id: z.string().trim().optional(),
  title: z
    .string()
    .trim()
    .min(3, "Escreva um título mais descritivo.")
    .max(120),
  issuer: z
    .string()
    .trim()
    .min(2, "Informe quem emitiu a certificação.")
    .max(120),
  date: z.string().trim(),
  credentialId: z.string().trim().max(80).optional(),
  credentialUrl: z.string().trim().max(300).optional(),
  description: z
    .string()
    .trim()
    .min(10, "A descrição precisa ter pelo menos 10 caracteres.")
    .max(320),
  existingImage: z.string().trim().optional(),
  expectedSha: z.string().trim().optional(),
});

export type ValidatedCertificationInput = {
  certification: Certification;
  expectedSha?: string;
};

export type CertificationFormValidation =
  | { data: ValidatedCertificationInput; success: true }
  | {
      fieldErrors: Record<string, string[]>;
      message: string;
      success: false;
    };

function getString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

export function validateCertificationForm(
  formData: FormData,
): CertificationFormValidation {
  const fieldsResult = editorFieldsSchema.safeParse({
    id: getString(formData, "id") || undefined,
    title: getString(formData, "title"),
    issuer: getString(formData, "issuer"),
    date: getString(formData, "date"),
    credentialId: getString(formData, "credentialId") || undefined,
    credentialUrl: getString(formData, "credentialUrl") || undefined,
    description: getString(formData, "description"),
    existingImage: getString(formData, "existingImage") || undefined,
    expectedSha: getString(formData, "expectedSha") || undefined,
  });

  if (!fieldsResult.success) {
    return {
      success: false,
      message: "Revise os campos destacados antes de salvar.",
      fieldErrors: zodFieldErrors(fieldsResult.error),
    };
  }

  const fields = fieldsResult.data;
  const certificationResult = certificationSchema.safeParse({
    id: fields.id || randomUUID(),
    title: fields.title,
    issuer: fields.issuer,
    date: fields.date,
    credentialId: fields.credentialId,
    credentialUrl: fields.credentialUrl,
    description: fields.description,
    imagePath: fields.existingImage,
  });

  if (!certificationResult.success) {
    return {
      success: false,
      message: "Revise os dados da certificação antes de salvar.",
      fieldErrors: zodFieldErrors(certificationResult.error),
    };
  }

  return {
    success: true,
    data: {
      certification: certificationResult.data,
      expectedSha: fields.expectedSha,
    },
  };
}
