import { PublicFooter } from "@/components/PublicFooter";
import { PublicNavbar } from "@/components/PublicNavbar";
import { HomeAbout } from "@/components/HomeAbout";
import { HomeDepartments, HomeDocuments, HomeEvents, HomeNews, HomePrograms } from "@/components/HomeDataSection";
import { HomeHero } from "@/components/HomeHero";

export default function HomePage() {
  return (
    <div className="grain relative min-h-screen overflow-x-hidden bg-background">
      <PublicNavbar />
      <main>
        <HomeHero />
        <HomeAbout />
        <HomeDepartments />
        <HomePrograms />
        <HomeEvents />
        <HomeNews />
        <HomeDocuments />
      </main>
      <PublicFooter />
    </div>
  );
}
