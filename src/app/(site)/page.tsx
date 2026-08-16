import { AuthorStrip } from "@/components/home/author-strip";
import { CategoryDirectory } from "@/components/home/category-directory";
import { Hero } from "@/components/home/hero";
import { LabPreview } from "@/components/home/lab-preview";
import { RecentEntries } from "@/components/home/recent-entries";
import { getAllArticles } from "@/lib/articles";

export default function Home() {
  const articles = getAllArticles();

  return (
    <>
      <Hero articles={articles} />
      <RecentEntries articles={articles} />
      <CategoryDirectory articles={articles} />
      <LabPreview />
      <AuthorStrip />
    </>
  );
}
