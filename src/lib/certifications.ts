import "server-only";

import fs from "node:fs";
import path from "node:path";

import {
  validateCertification,
  type Certification,
} from "@/lib/certification-schema";

export type { Certification } from "@/lib/certification-schema";

const certificationsFilePath = path.join(
  process.cwd(),
  "content",
  "certifications.json",
);
let certificationsCache: Certification[] | undefined;

function readCertifications(): Certification[] {
  if (!fs.existsSync(certificationsFilePath)) return [];

  const raw = fs.readFileSync(certificationsFilePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("content/certifications.json deve conter um array.");
  }

  return parsed
    .map((item, index) =>
      validateCertification(item, `content/certifications.json[${index}]`),
    )
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function getAllCertifications(): Certification[] {
  certificationsCache ??= readCertifications();
  return certificationsCache;
}

export function clearCertificationsCache() {
  certificationsCache = undefined;
}
