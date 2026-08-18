import "server-only";

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { getGitHubContentConfig } from "@/lib/admin/config";
import {
  AdminContentConflictError,
  AdminStorageError,
  createGitHubBlob,
  getGitHubBlob,
  getGitHubHead,
  getGitHubTree,
  githubRepoPath,
  githubRequest,
  shouldUseGitHubStorage,
  type GitHubCreatedObject,
} from "@/lib/admin/article-repository";
import { assertAdminSession } from "@/lib/admin/session";
import type { ArticleMutationResult } from "@/lib/admin/types";
import { clearCertificationsCache } from "@/lib/certifications";
import {
  validateCertification,
  type Certification,
} from "@/lib/certification-schema";

const CERTIFICATIONS_PATH = "content/certifications.json";
const LOCAL_CERTIFICATIONS_FILE = path.join(
  process.cwd(),
  "content",
  "certifications.json",
);
const LOCAL_IMAGES_ROOT = path.join(
  process.cwd(),
  "public",
  "images",
  "certifications",
);

export type AdminCertification = Certification & { sha: string };

export type CertificationMutation = {
  certification: Certification;
  expectedSha?: string;
  image?: { bytes: Uint8Array; path: string };
};

export type CertificationMutationResult = ArticleMutationResult;

function localSha(source: string) {
  return createHash("sha256").update(source).digest("hex");
}

function serializeCertifications(certifications: Certification[]) {
  return `${JSON.stringify(certifications, null, 2)}\n`;
}

function parseCertificationsSource(source: string): Certification[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    throw new AdminStorageError("O arquivo de certificações está corrompido.");
  }

  if (!Array.isArray(parsed)) {
    throw new AdminStorageError("O arquivo de certificações está corrompido.");
  }

  return parsed.map((item, index) =>
    validateCertification(item, `${CERTIFICATIONS_PATH}[${index}]`),
  );
}

function upsertCertification(
  certifications: Certification[],
  certification: Certification,
) {
  return [
    ...certifications.filter((item) => item.id !== certification.id),
    certification,
  ];
}

function toAdminList(certifications: Certification[], sha: string) {
  return certifications
    .map((certification) => ({ ...certification, sha }))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

// --- GitHub-backed storage (production) ---

async function readGitHubCertifications() {
  const { commit } = await getGitHubHead();
  const tree = await getGitHubTree(commit.tree.sha);
  const entry = tree.tree.find(
    (item) => item.type === "blob" && item.path === CERTIFICATIONS_PATH,
  );

  if (!entry) {
    return { certifications: [] as Certification[], sha: "" };
  }

  const source = await getGitHubBlob(entry.sha);
  return { certifications: parseCertificationsSource(source), sha: entry.sha };
}

async function listGitHubCertifications(): Promise<AdminCertification[]> {
  const { certifications, sha } = await readGitHubCertifications();
  return toAdminList(certifications, sha);
}

async function getGitHubCertification(id: string) {
  const { certifications, sha } = await readGitHubCertifications();
  const certification = certifications.find((item) => item.id === id);
  return certification ? { ...certification, sha } : undefined;
}

async function writeGitHubCertifications(
  certifications: Certification[],
  expectedSha: string | undefined,
  image: { bytes: Uint8Array; path: string } | undefined,
  commitMessage: string,
): Promise<CertificationMutationResult> {
  const { branch, owner, repo } = getGitHubContentConfig();
  const { commit, headSha } = await getGitHubHead();
  const tree = await getGitHubTree(commit.tree.sha);
  const entry = tree.tree.find(
    (item) => item.type === "blob" && item.path === CERTIFICATIONS_PATH,
  );

  if (expectedSha && entry?.sha !== expectedSha) {
    throw new AdminContentConflictError();
  }

  const treeChanges: Array<{
    mode: "100644";
    path: string;
    sha: string;
    type: "blob";
  }> = [];

  const fileBlob = await createGitHubBlob(serializeCertifications(certifications));
  treeChanges.push({
    mode: "100644",
    path: CERTIFICATIONS_PATH,
    sha: fileBlob.sha,
    type: "blob",
  });

  if (image) {
    const imageBlob = await createGitHubBlob(image.bytes, true);
    treeChanges.push({
      mode: "100644",
      path: image.path,
      sha: imageBlob.sha,
      type: "blob",
    });
  }

  const newTree = await githubRequest<GitHubCreatedObject>(
    githubRepoPath("/git/trees"),
    {
      method: "POST",
      body: JSON.stringify({ base_tree: commit.tree.sha, tree: treeChanges }),
    },
  );
  const newCommit = await githubRequest<GitHubCreatedObject>(
    githubRepoPath("/git/commits"),
    {
      method: "POST",
      body: JSON.stringify({
        message: commitMessage,
        parents: [headSha],
        tree: newTree.sha,
      }),
    },
  );

  await githubRequest<GitHubCreatedObject>(
    githubRepoPath(`/git/refs/heads/${branch}`),
    {
      method: "PATCH",
      body: JSON.stringify({ force: false, sha: newCommit.sha }),
    },
  );

  return {
    commitSha: newCommit.sha,
    commitUrl: `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commit/${newCommit.sha}`,
    mode: "github",
  };
}

async function saveGitHubCertification(
  mutation: CertificationMutation,
): Promise<CertificationMutationResult> {
  const { certification, expectedSha, image } = mutation;
  const { certifications } = await readGitHubCertifications();
  const isNew = !certifications.some((item) => item.id === certification.id);
  const next = upsertCertification(certifications, certification);

  return writeGitHubCertifications(
    next,
    expectedSha,
    image,
    isNew
      ? `Adiciona certificação: ${certification.title}`
      : `Atualiza certificação: ${certification.title}`,
  );
}

async function deleteGitHubCertification(
  id: string,
): Promise<CertificationMutationResult> {
  const { certifications } = await readGitHubCertifications();
  const target = certifications.find((item) => item.id === id);
  if (!target) throw new AdminStorageError("Certificação não encontrada.");

  const next = certifications.filter((item) => item.id !== id);
  return writeGitHubCertifications(
    next,
    undefined,
    undefined,
    `Remove certificação: ${target.title}`,
  );
}

// --- Local filesystem storage (development) ---

async function readLocalCertifications() {
  let source: string;
  try {
    source = await fs.readFile(LOCAL_CERTIFICATIONS_FILE, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { certifications: [] as Certification[], sha: "" };
    }
    throw error;
  }

  return { certifications: parseCertificationsSource(source), sha: localSha(source) };
}

async function listLocalCertifications(): Promise<AdminCertification[]> {
  const { certifications, sha } = await readLocalCertifications();
  return toAdminList(certifications, sha);
}

async function getLocalCertification(id: string) {
  const { certifications, sha } = await readLocalCertifications();
  const certification = certifications.find((item) => item.id === id);
  return certification ? { ...certification, sha } : undefined;
}

async function writeLocalCertifications(
  certifications: Certification[],
  image?: { bytes: Uint8Array; path: string },
): Promise<CertificationMutationResult> {
  await fs.mkdir(path.dirname(LOCAL_CERTIFICATIONS_FILE), { recursive: true });

  if (image) {
    await fs.mkdir(LOCAL_IMAGES_ROOT, { recursive: true });
    await fs.writeFile(
      path.join(LOCAL_IMAGES_ROOT, path.basename(image.path)),
      image.bytes,
    );
  }

  const source = serializeCertifications(certifications);
  await fs.writeFile(LOCAL_CERTIFICATIONS_FILE, source, "utf8");
  clearCertificationsCache();

  return { commitSha: localSha(source), mode: "local" };
}

async function saveLocalCertification(
  mutation: CertificationMutation,
): Promise<CertificationMutationResult> {
  const { certification, expectedSha, image } = mutation;
  const { certifications, sha } = await readLocalCertifications();

  if (expectedSha && sha !== expectedSha) {
    throw new AdminContentConflictError();
  }

  return writeLocalCertifications(
    upsertCertification(certifications, certification),
    image,
  );
}

async function deleteLocalCertification(
  id: string,
): Promise<CertificationMutationResult> {
  const { certifications } = await readLocalCertifications();
  return writeLocalCertifications(
    certifications.filter((item) => item.id !== id),
  );
}

// --- Public API ---

export async function listAdminCertifications(): Promise<AdminCertification[]> {
  await assertAdminSession();
  return shouldUseGitHubStorage()
    ? listGitHubCertifications()
    : listLocalCertifications();
}

export async function getAdminCertification(
  id: string,
): Promise<AdminCertification | undefined> {
  await assertAdminSession();
  return shouldUseGitHubStorage()
    ? getGitHubCertification(id)
    : getLocalCertification(id);
}

export async function saveAdminCertification(
  mutation: CertificationMutation,
): Promise<CertificationMutationResult> {
  await assertAdminSession();
  return shouldUseGitHubStorage()
    ? saveGitHubCertification(mutation)
    : saveLocalCertification(mutation);
}

export async function deleteAdminCertification(
  id: string,
): Promise<CertificationMutationResult> {
  await assertAdminSession();
  return shouldUseGitHubStorage()
    ? deleteGitHubCertification(id)
    : deleteLocalCertification(id);
}
