import { ModuleIntro } from "@/components/ModuleIntro";
import { PortalPage } from "@/components/PortalPage";

export default async function AspirationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PortalPage activeHref="/portal/aspirasi" title="Detail Aspirasi" description="Detail aspirasi berisi isi, timeline status, respons admin, dan lampiran bila tersedia."><ModuleIntro title={`Aspirasi ${id}`} description="Data hanya boleh dibaca oleh mahasiswa pemilik aspirasi, Admin Advokesma, atau Super Admin sesuai RBAC." /></PortalPage>;
}
