import { PublicPageFrame } from "@/components/PublicPageFrame";
import { HomeAbout } from "@/components/HomeAbout";
import { HomeDepartments, HomeDocuments, HomeEvents, HomeNews, HomePrograms } from "@/components/HomeDataSection";
import { HomeHero } from "@/components/HomeHero";
import { getPublishedContents } from "@/server/public/data";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export default async function HomePage() {
  const { items: newsList } = await getPublishedContents({ limit: 3 });

  return (
    <PublicPageFrame>
      <HomeHero />
      <HomeAbout />
      <HomeDepartments />
      <HomePrograms />
      <HomeEvents />
      <HomeNews contents={newsList} />
      <HomeDocuments />
    </PublicPageFrame>
  );
}
