import { AdminCertificationForm } from "@/components/admin/admin-certification-form";
import { todayInTimeZone } from "@/lib/utils";

export default function NewAdminCertificationPage() {
  return <AdminCertificationForm today={todayInTimeZone()} />;
}
