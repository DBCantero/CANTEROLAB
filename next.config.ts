import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "3.5mb",
    },
  },
  async headers() {
    return [
      {
        source: "/icons/technologies/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=604800, stale-while-revalidate=2592000",
          },
        ],
      },
      ...["/admin/:path*", "/api/admin/:path*"].map((source) => ({
        source,
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      })),
    ];
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      "remark-gfm",
      "remark-frontmatter",
      ["remark-mdx-frontmatter", { name: "frontmatter" }],
      ["remark-toc", { heading: "sumário|conteúdo" }],
    ],
    rehypePlugins: [
      "rehype-slug",
      [
        "rehype-pretty-code",
        {
          theme: "github-dark-dimmed",
          keepBackground: false,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
