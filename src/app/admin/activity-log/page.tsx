import { AdminPage } from "@/components/AdminPage";
import { ActivityLog } from "@/components/admin/ActivityLog";
export default function ActivityLogPage() {
  return <AdminPage superOnly activeHref="/admin/activity-log" title="Activity Log" description="Jejak aktivitas Admin yang tidak dapat diedit atau dihapus."><ActivityLog /></AdminPage>;
}
