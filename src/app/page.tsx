import { PublicPageFrame } from "@/components/PublicPageFrame";
import { HomeAbout } from "@/components/HomeAbout";
import { HomeDepartments, HomeDocuments, HomeEvents, HomeNews, HomePrograms } from "@/components/HomeDataSection";
import { HomeHero } from "@/components/HomeHero";

export default function HomePage() {
  return (
    <PublicPageFrame>
      <HomeHero />
      <HomeAbout />
      <HomeDepartments />
      <HomePrograms />
      <HomeEvents />
      <HomeNews />
      <HomeDocuments />
    </PublicPageFrame>
  );
}
