import { AdminEditorForm } from "@/components/admin/admin-editor-form";
import { assertAdminSession } from "@/lib/admin/session";
import { todayInTimeZone } from "@/lib/utils";

export default async function NewAdminArticlePage() {
  await assertAdminSession();
  return <AdminEditorForm today={todayInTimeZone()} />;
}
