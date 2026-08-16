import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getAllArticles } from "@/lib/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const latestArticleDate = articles.reduce<Date | undefined>((latest, article) => {
    const date = new Date(`${article.updated ?? article.date}T00:00:00.000Z`);
    return !latest || date > latest ? date : latest;
  }, undefined);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: latestArticleDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/artigos`,
      lastModified: latestArticleDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...["/lab", "/projetos", "/certificacoes", "/recursos", "/sobre"].map(
      (route) => ({
        url: `${siteConfig.url}${route}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }),
    ),
  ];

  const categoryRoutes = Array.from(
    new Set(articles.map((article) => article.categorySlug)),
  ).map((category) => ({
    url: `${siteConfig.url}/artigos/${category}`,
    lastModified: articles
      .filter((article) => article.categorySlug === category)
      .reduce<Date | undefined>((latest, article) => {
        const date = new Date(
          `${article.updated ?? article.date}T00:00:00.000Z`,
        );
        return !latest || date > latest ? date : latest;
      }, undefined),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articleRoutes = articles.map((article) => ({
    url: `${siteConfig.url}${article.href}`,
    lastModified: new Date(`${article.updated ?? article.date}T00:00:00.000Z`),
    changeFrequency: "monthly" as const,
    priority: article.featured ? 0.8 : 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
