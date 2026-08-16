import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CanteroLab",
    short_name: "CanteroLab",
    description:
      "Código, dados e experiências do dia a dia em um laboratório pessoal.",
    start_url: "/",
    display: "standalone",
    background_color: "#070b10",
    theme_color: "#070b10",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
