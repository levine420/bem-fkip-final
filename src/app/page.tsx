import { PublicPageFrame } from "@/components/PublicPageFrame";
import { HomeAbout } from "@/components/HomeAbout";
import { HomeDepartments, HomeDocuments, HomeEvents, HomeNews, HomePrograms } from "@/components/HomeDataSection";
import { HomeHero } from "@/components/HomeHero";
import {
  getActiveDepartments,
  getActivePeriod,
  getPublicDocuments,
  getPublicEvents,
  getPublishedContents,
  getPublicWorkPrograms,
} from "@/server/public/data";

export const revalidate = 60;

export default async function HomePage() {
  const [
    { items: newsList },
    departments,
    programs,
    events,
    documents,
    period,
  ] = await Promise.all([
    getPublishedContents({ limit: 3 }),
    getActiveDepartments(),
    getPublicWorkPrograms(),
    getPublicEvents({ limit: 4 }),
    getPublicDocuments(),
    getActivePeriod(),
  ]);

  return (
    <PublicPageFrame>
      <HomeHero period={period} />
      <HomeAbout />
      <HomeDepartments departments={departments} />
      <HomePrograms programs={programs} departments={departments} />
      <HomeEvents events={events} />
      <HomeNews contents={newsList} />
      <HomeDocuments documents={documents} />
    </PublicPageFrame>
  );
}
