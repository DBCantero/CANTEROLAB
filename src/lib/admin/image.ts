import "server-only";

import sharp from "sharp";

const MAX_IMAGE_BYTES = 3_000_000;
const MAX_IMAGE_PIXELS = 20_000_000;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function hasSupportedSignature(bytes: Uint8Array) {
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";

  return isJpeg || isPng || isWebp;
}

export async function processSocialImage(file: File) {
  if (file.size === 0) return undefined;

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("A imagem pode ter no máximo 3 MB.");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Envie uma imagem JPG, PNG ou WebP.");
  }

  const input = new Uint8Array(await file.arrayBuffer());
  if (!hasSupportedSignature(input)) {
    throw new Error("O conteúdo do arquivo não corresponde a uma imagem válida.");
  }

  try {
    const pipeline = sharp(input, {
      failOn: "error",
      limitInputPixels: MAX_IMAGE_PIXELS,
    }).rotate();
    const metadata = await pipeline.metadata();

    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width * metadata.height > MAX_IMAGE_PIXELS
    ) {
      throw new Error("Dimensões de imagem inválidas.");
    }

    const bytes = await pipeline
      .resize(1200, 630, { fit: "cover", position: "attention" })
      .webp({ quality: 84 })
      .toBuffer();

    return new Uint8Array(bytes);
  } catch {
    throw new Error("Não foi possível processar esta imagem.");
  }
}
