"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { articleFrontmatterSchema } from "@/lib/article-schema";
import { validateArticleForm } from "@/lib/admin/article-content";
import { processSocialImage } from "@/lib/admin/image";
import {
  AdminContentConflictError,
  AdminStorageError,
  saveAdminArticle,
} from "@/lib/admin/article-repository";
import {
  AdminUnauthorizedError,
  assertAdminSession,
  deleteAdminSession,
} from "@/lib/admin/session";
import type { AdminActionState, AdminArticle } from "@/lib/admin/types";

export async function logoutAdminAction() {
  await deleteAdminSession();
  redirect("/admin/login");
}

export async function saveArticleAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await assertAdminSession();
  } catch {
    redirect("/admin/login");
  }

  const validation = await validateArticleForm(formData);
  if (!validation.success) {
    return {
      status: "error",
      message: validation.message,
      fieldErrors: validation.fieldErrors,
    };
  }

  const input = validation.data;
  const upload = formData.get("socialImage");
  let imageBytes: Uint8Array | undefined;

  if (upload instanceof File && upload.size > 0) {
    try {
      imageBytes = await processSocialImage(upload);
    } catch (error) {
      return {
        status: "error",
        message: "Revise a imagem social.",
        fieldErrors: {
          socialImage: [
            error instanceof Error ? error.message : "Imagem inválida.",
          ],
        },
      };
    }
  }

  const imagePublicPath = imageBytes
    ? `/images/articles/${input.categorySlug}-${input.slug}.webp`
    : input.frontmatter.image;
  const frontmatterResult = articleFrontmatterSchema.safeParse({
    ...input.frontmatter,
    image: imagePublicPath,
  });

  if (!frontmatterResult.success) {
    return {
      status: "error",
      message: "A imagem informada não é válida.",
      fieldErrors: { socialImage: ["Escolha outra imagem."] },
    };
  }

  const article: AdminArticle = {
    ...frontmatterResult.data,
    body: input.body,
    categorySlug: input.categorySlug,
    href: `/artigos/${input.categorySlug}/${input.slug}`,
    path: input.path,
    sha: input.expectedSha ?? "",
    slug: input.slug,
  };

  let result: Awaited<ReturnType<typeof saveAdminArticle>>;
  try {
    result = await saveAdminArticle({
      article,
      expectedSha: input.expectedSha,
      image: imageBytes
        ? {
            bytes: imageBytes,
            path: `public/images/articles/${input.categorySlug}-${input.slug}.webp`,
          }
        : undefined,
      originalPath: input.originalPath,
    });

  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      redirect("/admin/login");
    }

    if (error instanceof AdminContentConflictError) {
      return { status: "error", message: error.message };
    }

    if (error instanceof AdminStorageError) {
      return { status: "error", message: error.message };
    }

    return {
      status: "error",
      message: "Não foi possível salvar agora. Seu texto continua no editor.",
    };
  }

  revalidatePath("/admin", "layout");
  const outcome =
    result.mode === "local"
      ? "local"
      : article.published
        ? "sent"
        : "draft";
  redirect(
    `/admin/artigos/${article.categorySlug}/${article.slug}?result=${outcome}`,
  );
}
